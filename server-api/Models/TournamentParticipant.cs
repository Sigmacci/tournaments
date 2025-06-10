using System.ComponentModel.DataAnnotations.Schema;
using server_api.Models;

namespace server_api.Models;

using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;
using Microsoft.EntityFrameworkCore;

[Index(nameof(TournamentId), nameof(LicenseNumber), IsUnique = true)]
[Index(nameof(TournamentId), nameof(Rank), IsUnique = true)]
public class TournamentParticipant
{
    public int Id { get; set; }
    public string UserId { get; set; } = null!;
    public int TournamentId { get; set; }

    [ForeignKey(nameof(TournamentId))]
    [JsonIgnore]
    public Tournament Tournament { get; set; }

    public string LicenseNumber { get; set; } = null!;
    public int Rank { get; set; } = 0;
    public bool IsSeeded { get; set; }

    [ForeignKey(nameof(UserId))]
    [JsonIgnore]
    public User Participant { get; set; } = null!;
}