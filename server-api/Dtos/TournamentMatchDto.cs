using server_api.Dtos;

namespace server_api.Dtos;

public class TournamentMatchDto
{
    public int Id { get; set; }
    public int TournamentId { get; set; }
    public string Participant1Id { get; set; }
    public string Participant2Id { get; set; }
    public string Result { get; set; }
    public int MaxParticipants { get; set; }

    public ParticipantDto Participant1 { get; set; }
    public ParticipantDto Participant2 { get; set; }
}