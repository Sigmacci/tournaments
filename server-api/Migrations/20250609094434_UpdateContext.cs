using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace server_api.Migrations
{
    /// <inheritdoc />
    public partial class UpdateContext : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_SponsorLogo_Tournaments_TournamentId",
                table: "SponsorLogo");

            migrationBuilder.DropForeignKey(
                name: "FK_TournamentParticipant_AspNetUsers_ParticipantId",
                table: "TournamentParticipant");

            migrationBuilder.DropForeignKey(
                name: "FK_TournamentParticipant_Tournaments_TournamentId",
                table: "TournamentParticipant");

            migrationBuilder.DropPrimaryKey(
                name: "PK_TournamentParticipant",
                table: "TournamentParticipant");

            migrationBuilder.DropPrimaryKey(
                name: "PK_SponsorLogo",
                table: "SponsorLogo");

            migrationBuilder.RenameTable(
                name: "TournamentParticipant",
                newName: "TournamentParticipants");

            migrationBuilder.RenameTable(
                name: "SponsorLogo",
                newName: "SponsorLogos");

            migrationBuilder.RenameIndex(
                name: "IX_TournamentParticipant_TournamentId_Rank",
                table: "TournamentParticipants",
                newName: "IX_TournamentParticipants_TournamentId_Rank");

            migrationBuilder.RenameIndex(
                name: "IX_TournamentParticipant_TournamentId_LicenseNumber",
                table: "TournamentParticipants",
                newName: "IX_TournamentParticipants_TournamentId_LicenseNumber");

            migrationBuilder.RenameIndex(
                name: "IX_TournamentParticipant_ParticipantId",
                table: "TournamentParticipants",
                newName: "IX_TournamentParticipants_ParticipantId");

            migrationBuilder.RenameIndex(
                name: "IX_SponsorLogo_TournamentId",
                table: "SponsorLogos",
                newName: "IX_SponsorLogos_TournamentId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_TournamentParticipants",
                table: "TournamentParticipants",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_SponsorLogos",
                table: "SponsorLogos",
                column: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_SponsorLogos_Tournaments_TournamentId",
                table: "SponsorLogos",
                column: "TournamentId",
                principalTable: "Tournaments",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_TournamentParticipants_AspNetUsers_ParticipantId",
                table: "TournamentParticipants",
                column: "ParticipantId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_TournamentParticipants_Tournaments_TournamentId",
                table: "TournamentParticipants",
                column: "TournamentId",
                principalTable: "Tournaments",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_SponsorLogos_Tournaments_TournamentId",
                table: "SponsorLogos");

            migrationBuilder.DropForeignKey(
                name: "FK_TournamentParticipants_AspNetUsers_ParticipantId",
                table: "TournamentParticipants");

            migrationBuilder.DropForeignKey(
                name: "FK_TournamentParticipants_Tournaments_TournamentId",
                table: "TournamentParticipants");

            migrationBuilder.DropPrimaryKey(
                name: "PK_TournamentParticipants",
                table: "TournamentParticipants");

            migrationBuilder.DropPrimaryKey(
                name: "PK_SponsorLogos",
                table: "SponsorLogos");

            migrationBuilder.RenameTable(
                name: "TournamentParticipants",
                newName: "TournamentParticipant");

            migrationBuilder.RenameTable(
                name: "SponsorLogos",
                newName: "SponsorLogo");

            migrationBuilder.RenameIndex(
                name: "IX_TournamentParticipants_TournamentId_Rank",
                table: "TournamentParticipant",
                newName: "IX_TournamentParticipant_TournamentId_Rank");

            migrationBuilder.RenameIndex(
                name: "IX_TournamentParticipants_TournamentId_LicenseNumber",
                table: "TournamentParticipant",
                newName: "IX_TournamentParticipant_TournamentId_LicenseNumber");

            migrationBuilder.RenameIndex(
                name: "IX_TournamentParticipants_ParticipantId",
                table: "TournamentParticipant",
                newName: "IX_TournamentParticipant_ParticipantId");

            migrationBuilder.RenameIndex(
                name: "IX_SponsorLogos_TournamentId",
                table: "SponsorLogo",
                newName: "IX_SponsorLogo_TournamentId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_TournamentParticipant",
                table: "TournamentParticipant",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_SponsorLogo",
                table: "SponsorLogo",
                column: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_SponsorLogo_Tournaments_TournamentId",
                table: "SponsorLogo",
                column: "TournamentId",
                principalTable: "Tournaments",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_TournamentParticipant_AspNetUsers_ParticipantId",
                table: "TournamentParticipant",
                column: "ParticipantId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_TournamentParticipant_Tournaments_TournamentId",
                table: "TournamentParticipant",
                column: "TournamentId",
                principalTable: "Tournaments",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
