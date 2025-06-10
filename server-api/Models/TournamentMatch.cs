using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;
using server_api.Models;

namespace server_api.Models;

public class TournamentMatch
{
    public int Id { get; set; }
    public int TournamentId { get; set; }
    public int? Participant1Id { get; set; }
    public int? Participant2Id { get; set; }
    public string? Result { get; set; } = "N";
    public string? SubmittedByParticipant1 { get; set; }
    public string? SubmittedByParticipant2 { get; set; }
    public int? NextMatchId { get; set; } 
    public bool IsParticipant1InNextMatch { get; set; } 

    [ForeignKey(nameof(NextMatchId))]
    [JsonIgnore]
    public TournamentMatch? NextMatch { get; set; }

    [ForeignKey(nameof(TournamentId))]
    [JsonIgnore]
    public Tournament Tournament { get; set; } = null!;
    [ForeignKey(nameof(Participant1Id))]
    [JsonIgnore]
    public TournamentParticipant Participant1 { get; set; } = null!;
    [ForeignKey(nameof(Participant2Id))]
    [JsonIgnore]
    public TournamentParticipant Participant2 { get; set; } = null!;
}