namespace server_api.Dtos;

public class ParticipantAddDto
{
    public string LicenseNumber { get; set; } = null!;
    public int Rank { get; set; } = 0;
}