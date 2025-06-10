namespace server_api.Services;

public interface ILadderService
{
    Task ScheduleMatchesAsync();
    Task GenerateLadderForTournament(int tournamentId);
}