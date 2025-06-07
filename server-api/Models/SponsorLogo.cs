using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;
using server_api.Models;

namespace server_api.Models;
public class SponsorLogo
{
    public int Id { get; set; }
    public int TournamentId { get; set; }
    [JsonIgnore]
    [ForeignKey(nameof(TournamentId))]
    public Tournament Tournament { get; set; }
    public string LogoUrl { get; set; } = null!;
}
