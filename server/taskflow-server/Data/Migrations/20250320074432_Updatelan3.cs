using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace taskflow_server.Data.Migrations
{
    /// <inheritdoc />
    public partial class Updatelan3 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Enddate_at",
                table: "Tasks");

            migrationBuilder.DropColumn(
                name: "FileRequired",
                table: "Columns");

            migrationBuilder.AddColumn<string>(
                name: "Priority",
                table: "Tasks",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Priority",
                table: "Tasks");

            migrationBuilder.AddColumn<DateTime>(
                name: "Enddate_at",
                table: "Tasks",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<bool>(
                name: "FileRequired",
                table: "Columns",
                type: "bit",
                nullable: false,
                defaultValue: false);
        }
    }
}
