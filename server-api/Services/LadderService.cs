using Microsoft.EntityFrameworkCore;
using server_api.Models;
using server_api.Services;

namespace server_api.Services;

public class LadderService : ILadderService
{
    private readonly AppDbContext _db;

    public LadderService(AppDbContext db)
    {
        _db = db;
    }

    public async Task ScheduleMatchesAsync()
    {
        var now = DateTime.UtcNow;

        var tournamentsToSchedule = await _db.Tournaments
            .Include(t => t.Participants)
            .Where(t => t.Status == "Open")
            .ToListAsync();

        if (tournamentsToSchedule.Any())
        {
            tournamentsToSchedule = tournamentsToSchedule
                .FindAll(t => t.EventTime.ToUniversalTime() <= now);

            Console.WriteLine($"Found {tournamentsToSchedule.Count} tournaments to schedule.");
        }
        else
        {
            Console.WriteLine("No tournaments to schedule.");
            return;
        }

        var tournamentIdsWithMatches = await _db.Matches
            .Select(m => m.TournamentId)
            .Distinct()
            .ToListAsync();

        foreach (var tournament in tournamentsToSchedule)
        {
            try
            {
                await GenerateLadderForTournament(tournament.Id);
                tournament.Status = "Scheduled";
                await _db.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error scheduling tournament {tournament.Id}: {ex.Message}");
            }
        }
    }

    public async Task GenerateLadderForTournament(int tournamentId)
    {
        var tournament = await _db.Tournaments
            .Include(t => t.Participants)
            .Include(t => t.Matches)
            .FirstOrDefaultAsync(t => t.Id == tournamentId);

        if (tournament == null)
            throw new Exception("Tournament not found");

        if (DateTime.UtcNow < tournament.ParticipationDeadline.ToUniversalTime())
            throw new Exception("Cannot generate ladder before participation deadline.");

        if (tournament.Matches.Any())
            throw new Exception("Ladder already generated for this tournament.");

        var participants = tournament.Participants.OrderBy(p => p.Rank).ToList();
        int total = participants.Count;

        if ((total & (total - 1)) != 0)
            throw new InvalidOperationException("Participant count must be a power of 2 for a proper bracket.");

        if (tournament.Discipline == "chess")
        {
            var matches = GenerateRoundRobin(participants, tournamentId);
            _db.Matches.AddRange(matches);
            await _db.SaveChangesAsync();
        }
        else
        {
            var matches = GenerateSingleElimination(participants, tournamentId);
            _db.Matches.AddRange(matches);
            await _db.SaveChangesAsync();
        }
    }

    private List<TournamentMatch> GenerateSingleElimination(List<TournamentParticipant> participants, int tournamentId)
    {
        int count = participants.Count;

        if ((count & (count - 1)) != 0)
            throw new Exception("Participants count must be power of 2 for single elimination.");

        var sorted = participants.OrderBy(p => p.Rank).ToList();
        var matches = new List<TournamentMatch>();

        for (int i = 0; i < count / 2; i++)
        {
            var p1 = sorted[i];
            var p2 = sorted[count - 1 - i];

            matches.Add(new TournamentMatch
            {
                TournamentId = tournamentId,
                Participant1Id = p1.Id,
                Participant2Id = p2.Id,
                Result = "N"
            });
        }

        return matches;
    }

    private List<TournamentMatch> GenerateRoundRobin(List<TournamentParticipant> participants, int tournamentId)
    {
        var matches = new List<TournamentMatch>();

        for (int i = 0; i < participants.Count; i++)
        {
            for (int j = i + 1; j < participants.Count; j++)
            {
                matches.Add(new TournamentMatch
                {
                    TournamentId = tournamentId,
                    Participant1Id = participants[i].Id,
                    Participant2Id = participants[j].Id,
                    Result = "N"
                });
            }
        }

        return matches;
    }

}
