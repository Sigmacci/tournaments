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
            .ToListAsync();

        tournaments = tournaments.FindAll(t => t.EventTime.ToUniversalTime() > now);

        return Ok(tournaments);
    }

    [Authorize]
    [HttpGet("upcoming/my")]
    public async Task<IActionResult> GetUsersUpcomingTournaments()
    {
        var tournaments = await _context.Tournaments
            .Include(t => t.Participants)
            .Where(t => t.Participants.Any(p => p.UserId == User.FindFirstValue(ClaimTypes.NameIdentifier)))
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
    [HttpPut("edit/{id}")]
    public async Task<IActionResult> CreateTournament(int id, [FromBody] CreateTournamentDto dto)
    {
        var tournament = await _context.Tournaments.FindAsync(id);
        if (tournament == null)
            return NotFound("Tournament not found.");

        if (dto.EventTime <= DateTime.UtcNow)
            return BadRequest("Start date must be in the future.");
        if (dto.ParticipationDeadline >= dto.EventTime)
            return BadRequest("Application deadline must be before the start date.");


        tournament.Name = dto.Name;
        tournament.Discipline = dto.Discipline;
        tournament.OrganizerId = dto.OrganizerId;
        tournament.EventTime = dto.EventTime;
        tournament.ParticipationDeadline = dto.ParticipationDeadline;
        tournament.LocationName = dto.LocationName;
        tournament.Latitude = dto.Latitude;
        tournament.Longitude = dto.Longitude;
        tournament.MaxParticipants = dto.MaxParticipants;
        tournament.SponsorLogos = dto.SponsorLogos != null
            ? [.. dto.SponsorLogos.Select(logoUrl => new SponsorLogo { LogoUrl = logoUrl })]
            : new List<SponsorLogo>();


        await _context.SaveChangesAsync();

        await _context.Entry(tournament).Reference(t => t.Organizer).LoadAsync();

        return Ok(tournament);
    }


    [Authorize]
    [HttpPost("signup/{tournamentId}")]
    public async Task<IActionResult> SignUpForTournament(int tournamentId, [FromBody] ParticipantAddDto dto)
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
            var checkedLicense = tournament.Participants.Any(p => p.LicenseNumber == dto.LicenseNumber || p.Rank == dto.Rank);
            if (checkedLicense)
            {
                return BadRequest("License number or rank already exists in this tournament.");
            }

            if (tournament.EventTime.ToUniversalTime() <= DateTime.UtcNow)
                return BadRequest("Tournament has already started.");

            if (tournament.ParticipationDeadline.ToUniversalTime() < DateTime.UtcNow)
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
                UserId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? throw new InvalidOperationException("User not authenticated"),
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

    [Authorize]
    [HttpPost("{tournamentId}/{matchId}/submit-result")]
    public async Task<IActionResult> SubmitMatchResult(int tournamentId, int matchId, [FromQuery] string winnerId)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId == null)
            return Unauthorized("User not authenticated.");

        var match = await _context.Matches
            .Include(m => m.Participant1)
                .ThenInclude(p => p.Participant)
            .Include(m => m.Participant2)
                .ThenInclude(p => p.Participant)
            .FirstOrDefaultAsync(m => m.Id == matchId && m.TournamentId == tournamentId);

        if (match == null)
            return NotFound("Match not found.");

        if (match.Result != "N")
            return BadRequest("Match already finalized.");

        bool isUserP1 = match.Participant1.UserId == userId;
        bool isUserP2 = match.Participant2.UserId == userId;

        if (!isUserP1 && !isUserP2)
            return Forbid("You are not a participant in this match.");

        if (winnerId != match.Participant1.UserId && winnerId != match.Participant2.UserId)
            return BadRequest("Invalid winner ID. Must be one of the participants.");

        if (isUserP1)
            match.SubmittedByParticipant1 = winnerId;
        else
            match.SubmittedByParticipant2 = winnerId;

        if (match.SubmittedByParticipant1 != null && match.SubmittedByParticipant2 != null)
        {
            if (match.SubmittedByParticipant1 == match.SubmittedByParticipant2)
            {
                match.Result = match.SubmittedByParticipant1 == match.Participant1.UserId ? "1" : "2";

                var winnerParticipantId = match.Result == "1"
                    ? match.Participant1.Id
                    : match.Participant2.Id;

                if (_context.Tournaments
                    .Where(t => t.Id == tournamentId)
                    .FirstOrDefault()
                    .Discipline != "chess")
                {
                    var emptyMatch = await _context.Matches
                        .FirstOrDefaultAsync(m => m.TournamentId == tournamentId && m.Participant2Id == null);

                    var matchesPlayed = await _context.Matches
                        .Where(m => m.TournamentId == tournamentId && m.Result != "N")
                        .ToListAsync();

                    if (emptyMatch != null)
                    {
                        emptyMatch.Participant2Id = winnerParticipantId;
                        _context.Entry(emptyMatch).State = EntityState.Modified;
                    }
                    else if (matchesPlayed.Count == _context.Tournaments
                        .Where(t => t.Id == tournamentId)
                        .Select(t => t.MaxParticipants)
                        .FirstOrDefault() - 2)
                    {
                        var newMatch = new TournamentMatch
                        {
                            TournamentId = tournamentId,
                            Participant1Id = winnerParticipantId,
                            Participant2Id = winnerParticipantId,
                            Result = "F"
                        };
                        _context.Matches.Add(newMatch);
                    }
                    else
                    {
                        var newMatch = new TournamentMatch
                        {
                            TournamentId = tournamentId,
                            Participant1Id = winnerParticipantId,
                            Result = "N"
                        };
                        _context.Matches.Add(newMatch);
                    }
                }
            }
            else
            {
                match.SubmittedByParticipant1 = null;
                match.SubmittedByParticipant2 = null;
                match.Result = "N";
                _context.Entry(match).State = EntityState.Modified;
                await _context.SaveChangesAsync();
                return BadRequest("Both participants must agree on the result.");
            }
        }

        await _context.SaveChangesAsync();
        return Ok(await _context.Matches.ToListAsync());
    }

    [HttpGet("{id}/matches")]
    public async Task<IActionResult> GetTournamentMatches(int id)
    {
        var matches = await _context.Matches
            .Where(m => m.TournamentId == id)
            .Include(m => m.Participant1.Participant)
            .Include(m => m.Participant2.Participant)
            .Select(m => new TournamentMatchDto
            {
                Id = m.Id,
                TournamentId = m.TournamentId,
                Participant1Id = m.Participant1.UserId,
                Participant2Id = m.Participant2.UserId,
                Result = m.Result,
                Participant1 = new ParticipantDto
                {
                    Id = m.Participant1.UserId,
                    FirstName = m.Participant1.Participant.FirstName,
                    LastName = m.Participant1.Participant.LastName
                },
                Participant2 = new ParticipantDto
                {
                    Id = m.Participant2.UserId,
                    FirstName = m.Participant2.Participant.FirstName,
                    LastName = m.Participant2.Participant.LastName
                }
            })
            .ToListAsync();

        return Ok(matches);
    }

    [HttpGet("{id}/participants")]
    public async Task<IActionResult> GetTournamentParticipants(int id)
    {
        var participants = await _context.TournamentParticipants
            .Where(p => p.TournamentId == id)
            .Include(p => p.Participant)
            .Select(p => new ParticipantDto
            {
                Id = p.UserId,
                FirstName = p.Participant.FirstName,
                LastName = p.Participant.LastName
            })
            .ToListAsync();

        return Ok(participants);
    }

}