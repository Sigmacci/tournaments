using System.Net;
using System.Net.Mail;

namespace server_api.Services;
public class EmailService : IEmailService
{
    private NetworkCredential readCredenials()
    {
        var json = File.ReadAllText("smtp-credentials.json");
        var creds = System.Text.Json.JsonSerializer.Deserialize<Dictionary<string, string>>(json);
        return new NetworkCredential(creds?["username"], creds?["password"]);
    }
    public async Task SendEmailAsync(string to, string subject, string body)
    {
        using var client = new SmtpClient("sandbox.smtp.mailtrap.io")
        {
            Credentials = readCredenials(),
            EnableSsl = true
        };
        var mail = new MailMessage("noreply@yourapp.com", to, subject, body)
        {
            IsBodyHtml = true
        };
        await client.SendMailAsync(mail);
    }
}