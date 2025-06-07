using System.ComponentModel.DataAnnotations.Schema;

namespace server_api.Models;

public enum DisciplineType
{
    Football,
    Basketball,
    Tennis,
    Chess,
    Running
}

public class Tournament
{
    public int Id { get; set; }

    public string Name { get; set; } = null!;
    public string Discipline { get; set; } = null!;       
    public string OrganizerId { get; set; } = null!;  
    public DateTime EventTime { get; set; }


    public string LocationName { get; set; } = null!;      
    public double Latitude { get; set; }
    public double Longitude { get; set; }

    public int MaxParticipants { get; set; }

    public DateTime ParticipationDeadline { get; set; }

    public int RankedPlayersCount { get; set; }

    public ICollection<SponsorLogo> SponsorLogos { get; set; } = [];
    public ICollection<TournamentParticipant> Participants { get; set; } = [];

    [ForeignKey(nameof(OrganizerId))]
    public User Organizer { get; set; } = null!;

    public bool IsOrganizer(string userId) => OrganizerId == userId;
}