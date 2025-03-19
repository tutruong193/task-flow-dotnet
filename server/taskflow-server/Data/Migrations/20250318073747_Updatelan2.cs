using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace taskflow_server.Data.Migrations
{
    /// <inheritdoc />
    public partial class Updatelan2 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "Enddate_at",
                table: "Tasks",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Enddate_at",
                table: "Tasks");
        }
    }
}
