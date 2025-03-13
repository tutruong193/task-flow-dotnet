using Azure.Core;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
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
        [HttpPost]
        public async Task<IActionResult> PostColumn(Column request)
        {
            var column = new Column
            {
                Id = Guid.NewGuid(),
                Name = request.Name,
                Position = request.Position,
                FileRequired = request.FileRequired,
                ProjectId = request.ProjectId

            };
            _context.Columns.Add(column);
            var result = await _context.SaveChangesAsync();
            if (result > 0)
            {
                return CreatedAtAction(nameof(GetById), new { id = column.Id }, request);
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
                FileRequired = column.FileRequired,
                ProjectId = column.ProjectId
            };
            return Ok(columnReturn);
        }
        [HttpPut("{id}")]
        public async Task<IActionResult> PutColumn(string id, [FromBody] Column request)
        {
            var column = await _context.Columns.FindAsync(id);
            if (column == null)
                return NotFound();

            column.Name = request.Name;
            column.Position = request.Position;
            column.FileRequired = request.FileRequired;

            _context.Columns.Update(column);
            var result = await _context.SaveChangesAsync();

            if (result > 0)
            {
                return NoContent();
            }
            return BadRequest();
        }
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteColumn(string id)
        {
            var function = await _context.Columns.FindAsync(id);
            if (function == null)
                return NotFound();

            _context.Columns.Remove(function);
            var result = await _context.SaveChangesAsync();
            if (result > 0)
            {
                return Ok();
            }
            return BadRequest();
        }
    }
}
