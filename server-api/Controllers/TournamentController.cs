using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using server_api.Dtos;
using server_api.Models;

namespace server_api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TournamentController : ControllerBase
{
    private readonly AppDbContext _context;

    public TournamentController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet("upcoming")]
    public async Task<IActionResult> GetUpcomingTournaments()
    {
        var now = DateTime.UtcNow;

        var tournaments = await _context.Tournaments
            .Where(t => t.EventTime >= now)
            .ToListAsync();

        return Ok(tournaments);
    }

    [Authorize]
    [HttpGet("upcoming/my")]
    public async Task<IActionResult> GetUsersUpcomingTournaments()
    {
        var now = DateTime.UtcNow;

        var tournaments = await _context.Tournaments
            .Include(t => t.Participants)
            .Where(t => t.EventTime >= now && 
                        t.Participants.Any(p => p.ParticipantId == User.FindFirstValue(ClaimTypes.NameIdentifier)))
            .ToListAsync();

        return Ok(tournaments);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetTournamentById(int id)
    {
        var tournament = await _context.Tournaments
            .Include(t => t.SponsorLogos)
            .Include(t => t.Organizer)
            .FirstOrDefaultAsync(t => t.Id == id);
        if (tournament == null)
            return NotFound();

        return Ok(tournament);
    }

    [Authorize]
    [HttpPost("create")]
    public async Task<IActionResult> CreateTournament([FromBody] CreateTournamentDto dto)
    {
        if (dto.EventTime <= DateTime.UtcNow)
            return BadRequest("Start date must be in the future.");
        if (dto.ParticipationDeadline >= dto.EventTime)
            return BadRequest("Application deadline must be before the start date.");

        var tournament = new Tournament
        {
            Name = dto.Name,
            Discipline = dto.Discipline,
            OrganizerId = dto.OrganizerId,
            EventTime = dto.EventTime,
            ParticipationDeadline = dto.ParticipationDeadline,
            LocationName = dto.LocationName,
            Latitude = dto.Latitude,
            Longitude = dto.Longitude,
            MaxParticipants = dto.MaxParticipants,
            SponsorLogos = dto.SponsorLogos != null
                ? [.. dto.SponsorLogos.Select(logoUrl => new SponsorLogo { LogoUrl = logoUrl })]
                : new List<SponsorLogo>()
        };

        _context.Tournaments.Add(tournament);
        await _context.SaveChangesAsync();

        await _context.Entry(tournament).Reference(t => t.Organizer).LoadAsync();

        return CreatedAtAction(nameof(GetTournamentById), new { id = tournament.Id }, tournament);
    }

    [Authorize]
    [HttpPost("signup/{tournamentId}")]
    public async Task<IActionResult> SignUpForTournament(int tournamentId, [FromBody] ParticipantDto dto)
    {
        var transaction = await _context.Database.BeginTransactionAsync();
        try
        {
            var tournament = await _context.Tournaments
                .Include(t => t.Participants)
                .FirstOrDefaultAsync(t => t.Id == tournamentId);

            if (tournament == null)
            {
                return NotFound("Tournament not found.");
            }

            if (tournament.EventTime <= DateTime.UtcNow)
                    return BadRequest("Tournament has already started.");

            if (tournament.ParticipationDeadline < DateTime.UtcNow)
                return BadRequest("Application deadline has passed.");

            if (tournament.Participants.Count >= tournament.MaxParticipants)
                return BadRequest("Tournament is full.");

            var existingParticipant = await _context.TournamentParticipants
                .FirstOrDefaultAsync(p => p.TournamentId == tournamentId && p.LicenseNumber == dto.LicenseNumber);
            if (existingParticipant != null)
                return BadRequest("You are already signed up for this tournament.");

            var participant = new TournamentParticipant
            {
                TournamentId = tournamentId,
                ParticipantId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? throw new InvalidOperationException("User not authenticated"),
                LicenseNumber = dto.LicenseNumber,
                Rank = dto.Rank
            };

            _context.TournamentParticipants.Add(participant);
            await _context.SaveChangesAsync();

            await transaction.CommitAsync();

            return Ok(participant);
        }
        catch
        {
            await transaction.RollbackAsync();
            throw;
        }
    }

}