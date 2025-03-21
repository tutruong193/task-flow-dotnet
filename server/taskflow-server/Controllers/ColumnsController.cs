using Azure.Core;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using taskflow_server.Data;
using taskflow_server.Data.Entities;
using taskflow_server.ViewModel;
using static System.Runtime.InteropServices.JavaScript.JSType;

namespace taskflow_server.Controllers
{
    public class ColumnsController : BaseController
    {
        private readonly AppDbContext _context;
        public ColumnsController(AppDbContext context)
        {
            _context = context;
        }
        [HttpPost("project/{projectId}")]
        public async Task<IActionResult> PostColumn(string projectId, Column request)
        {
            var column = new Column
            {
                Id = Guid.NewGuid(),
                Name = request.Name,
                Position = request.Position,
                ProjectId = Guid.Parse(projectId)

            };
            _context.Columns.Add(column);
            var result = await _context.SaveChangesAsync();
            if (result > 0)
            {
                return Ok();
            }
            else
            {
                return BadRequest();
            }
        }
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(string id)
        {
            var column = await _context.Columns.FindAsync(id);
            if (column == null)
                return NotFound();

            var columnReturn = new Column()
            {
                Id = column.Id,
                Name = column.Name,
                Position = column.Position,
                ProjectId = column.ProjectId
            };
            return Ok(columnReturn);
        }
        [HttpGet("project/{projectId}")]
        public async Task<IActionResult> GetColumnByProjectId(string projectId)
        {
            Guid projectGuid;
            if (!Guid.TryParse(projectId, out projectGuid))
            {
                return BadRequest("UserId không hợp lệ.");
            }
            var columns = await _context.Columns.Where(c => c.ProjectId == projectGuid).OrderBy(c => c.Position).ToListAsync();
            if (columns == null)
                return NotFound();
            return Ok(columns);
        }
        [HttpPut("project/{projectId}/batch-update")]
        public async Task<IActionResult> UpdateColumns(string projectId, [FromBody] List<Column> columns)
        {
            if (columns == null)
                return BadRequest("No columns provided");

            var projectGuid = Guid.Parse(projectId);

            var existingColumns = await _context.Columns
                                                .Where(c => c.ProjectId == projectGuid)
                                                .ToListAsync();

            var columnIds = columns.Select(c => c.Id).ToList();

            var columnsToDelete = existingColumns.Where(c => !columnIds.Contains(c.Id)).ToList();

            var columnsToUpdate = existingColumns.Where(c => columnIds.Contains(c.Id)).ToList();

            foreach (var column in columnsToUpdate)
            {
                var updatedColumn = columns.First(c => c.Id == column.Id);
                column.Name = updatedColumn.Name;
                column.Position = updatedColumn.Position;
            }
            if (columnsToDelete.Any())
            {
                _context.Columns.RemoveRange(columnsToDelete);
            }

            _context.Columns.UpdateRange(columnsToUpdate);
            var result = await _context.SaveChangesAsync();

            if (result > 0)
                return Ok();

            return BadRequest("Failed to update columns");
        }


    }
}
