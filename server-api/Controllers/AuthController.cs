using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using server_api.Dtos;
using server_api.Models;
using server_api.Services;

namespace server_api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly UserManager<User> _userManager;
    private readonly SignInManager<User> _signInManager;
    private readonly IConfiguration _config;
    private IEmailService _emailService;

    public AuthController(UserManager<User> userManager, SignInManager<User> signInManager, IConfiguration config, IEmailService emailService)
    {
        _userManager = userManager;
        _signInManager = signInManager;
        _config = config;
        _emailService = emailService;
    }

    private string GenerateJwtToken(User user)
    {
        if (user == null)
        {
            throw new ArgumentNullException(nameof(user), "User cannot be null.");
        }
        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id),
            new Claim(ClaimTypes.Email, user.Email ?? string.Empty)
        };

        var jwtKey = _config["Jwt:Key"];
        if (string.IsNullOrEmpty(jwtKey))
        {
            throw new InvalidOperationException("JWT key is not configured.");
        }
        var key = new SymmetricSecurityKey(System.Text.Encoding.UTF8.GetBytes(jwtKey));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: _config["Jwt:Issuer"],
            audience: _config["Jwt:Audience"],
            claims: claims,
            expires: DateTime.Now.AddHours(2),
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterDto registerDto)
    {
        var user = new User
        {
            UserName = registerDto.Email,
            Email = registerDto.Email,
            FirstName = registerDto.FirstName,
            LastName = registerDto.LastName
        };

        var result = await _userManager.CreateAsync(user, registerDto.Password);
        if (!result.Succeeded)
        {
            return BadRequest(new
            {
                message = "User registration failed.",
                errors = result.Errors.Select(e => e.Description)
            });
        }

        var token = await _userManager.GenerateEmailConfirmationTokenAsync(user);
        var encodedToken = System.Net.WebUtility.UrlEncode(token);

        var confirmationLink = Url.Action(
            "ConfirmEmail",
            "Auth",
            new { userId = user.Id, token = encodedToken },
            Request.Scheme
        );

        await _userManager.UpdateAsync(user);

        await _emailService.SendEmailAsync(
            user.Email,
            "Confirm your email",
            $"Please confirm your email by clicking this link: <a href='{confirmationLink}'>link</a>"
        );

        return Ok("User registered successfully. Please check your email to confirm your account.");
    }

    [HttpGet("confirm-email")]
    public async Task<IActionResult> ConfirmEmail(string userId, string token)
    {
        if (string.IsNullOrEmpty(userId) || string.IsNullOrEmpty(token))
        {
            return BadRequest("Invalid user ID or token.");
        }

        var user = await _userManager.FindByIdAsync(userId);
        if (user == null)
        {
            return NotFound("User not found.");
        }

        var decodedToken = System.Net.WebUtility.UrlDecode(token);
        var result = await _userManager.ConfirmEmailAsync(user, decodedToken);

        if (!result.Succeeded)
        {
            return BadRequest(result.Errors);
        }

        return Ok("Email confirmed successfully.");
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginDto loginDto)
    {
        var user = await _userManager.FindByEmailAsync(loginDto.Email);
        if (user == null)
            return Unauthorized("Invalid login.");

        var result = await _signInManager.CheckPasswordSignInAsync(user, loginDto.Password, false);
        if (!result.Succeeded)
            return Unauthorized("Invalid login.");

        var token = GenerateJwtToken(user);
        return Ok(new { token });
    }

    [HttpPost("forgot-password")]
    public async Task<IActionResult> ForgotPassword([FromQuery] string email)
    {
        var user = await _userManager.FindByEmailAsync(email);
        if (user == null)
        {
            return NotFound("User not found.");
        }

        var token = await _userManager.GeneratePasswordResetTokenAsync(user);
        var encodedToken = System.Net.WebUtility.UrlEncode(token);

        var resetLink = $"http://localhost:3000/reset-password?email={user.Email}&token={encodedToken}";

        await _emailService.SendEmailAsync(
            user.Email,
            "Reset your password",
            $"Please reset your password by clicking this link: <a href='{resetLink}'>link</a>"
        );

        return Ok("Password reset link sent to your email.");
    }

    [HttpPost("reset-password")]
    public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordDto dto)
    {
        var user = await _userManager.FindByEmailAsync(dto.Email);
        if (user == null)
            return NotFound("User not found.");

        var result = await _userManager.ResetPasswordAsync(user, dto.Token, dto.NewPassword);
        if (!result.Succeeded)
            return BadRequest(result.Errors);

        return Ok("Password has been reset.");
    }

    [Authorize]
    [HttpGet("me")]
    public async Task<IActionResult> GetCurrentUser()
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        if (userId == null)
            return Unauthorized();

        var user = await _userManager.FindByIdAsync(userId);
        if (user == null)
            return NotFound("User not found.");

        return Ok(new
        {
            user.Id,
            user.FirstName,
            user.LastName
        });
    }
}