using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using server_api.Dtos;
using server_api.Models;
using server_api.Services;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly UserManager<User> _userManager;
    private readonly SignInManager<User> _signInManager;
    private IEmailService _emailService;

    public AuthController(UserManager<User> userManager, SignInManager<User> signInManager, IEmailService emailService)
    {
        _userManager = userManager;
        _signInManager = signInManager;
        _emailService = emailService;
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
            foreach (var error in result.Errors)
            {
                Console.WriteLine($"{error.Code}: {error.Description}");
            }
            return BadRequest(result.Errors);
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
}