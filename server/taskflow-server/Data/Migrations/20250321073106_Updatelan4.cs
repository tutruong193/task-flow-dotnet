using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace taskflow_server.Data.Migrations
{
    /// <inheritdoc />
    public partial class Updatelan4 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ReporterId",
                table: "Tasks",
                type: "nvarchar(max)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ReporterId",
                table: "Tasks");
        }
    }
}
