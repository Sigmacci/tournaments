using server_api.Services;

namespace server_api.Services;
public class TournamentScheduler : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;

    public TournamentScheduler(IServiceProvider serviceProvider)
    {
        _serviceProvider = serviceProvider;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                using var scope = _serviceProvider.CreateScope();
                var tournamentService = scope.ServiceProvider.GetRequiredService<ILadderService>();
                await tournamentService.ScheduleMatchesAsync();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[TournamentScheduler Error]: {ex.Message}");
            }

            // Delay for 1 minute before running again
            await Task.Delay(TimeSpan.FromMinutes(1), stoppingToken);
        }
    }
}