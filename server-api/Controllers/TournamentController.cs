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

    [HttpGet("{id}")]
    public async Task<IActionResult> GetTournamentById(int id)
    {
        var tournament = await _context.Tournaments.FindAsync(id);
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

}