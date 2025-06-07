namespace server_api.Dtos;

public class CreateTournamentDto
{
    public string Name { get; set; } = null!;
    public string Discipline { get; set; } = null!;
    public string OrganizerId { get; set; } = null!;
    public DateTime EventTime { get; set; }
    public DateTime ParticipationDeadline { get; set; }
    public string LocationName { get; set; } = null!; 
    public double Latitude { get; set; }
    public double Longitude { get; set; }
    public int MaxParticipants { get; set; }
    public List<string>? SponsorLogos { get; set; }
}