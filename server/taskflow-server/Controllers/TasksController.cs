using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using taskflow_server.Data;
using taskflow_server.Data.Entities;
using taskflow_server.ViewModel;

namespace taskflow_server.Controllers
{
    public class TasksController : BaseController
    {
        private readonly AppDbContext _context;
        public TasksController(AppDbContext context)
        {
            _context = context;
        }
        [HttpPost("{projectId}")]
        public async Task<IActionResult> PostTask([FromBody] TaskModel request, string projectId)
        {
            Guid projectGuid;
            if (!Guid.TryParse(projectId, out projectGuid))
            {
                return BadRequest("Project không hợp lệ.");
            }
            string status = "todo";
            var task = new TaskModel
            {
                Id = Guid.NewGuid(),
                Title = request.Title,
                Description = request.Description,
                Status = status,
                ProjectId = projectGuid,
            };
            task.ColumnId = await _context.Columns
                .Where(c => c.ProjectId == projectGuid && c.Name == status)
                .Select(c => (Guid?)c.Id)
                .FirstOrDefaultAsync() ?? Guid.Empty;
            _context.Tasks.Add(task);
            if (task.ColumnId == null)
            {
                return BadRequest("Không tìm thấy ColumnId cho Project.");
            }
            var result = await _context.SaveChangesAsync();
            if (result > 0)
            {
                return CreatedAtAction(nameof(GetById), new { id = task.Id }, request);
            }
            else
            {
                return BadRequest();
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(string id)
        {
            if (!Guid.TryParse(id, out Guid taskId))
            {
                return BadRequest("Id hoặc ProjectId không hợp lệ.");
            }
            var task = await _context.Tasks.FirstOrDefaultAsync(t => t.Id == taskId);
            if (task == null)
                return NotFound();

            var taskReturn = new TaskVm()
            {
                Id = task.Id,
                Title = task.Title,
                Description = task.Description,
                Status = task.Status,
                Created_at = task.Created_at,
                Updated_at = task.Updated_at
            };
            return Ok(taskReturn);
        }
        [HttpGet("project/{projectId}")]
        public async Task<IActionResult> GetByProjectId(string projectId)
        {
            if (!Guid.TryParse(projectId, out Guid projectGuid))
            {
                return BadRequest("Id hoặc ProjectId không hợp lệ.");
            }
            var task = await _context.Tasks.Where(c => c.ProjectId == projectGuid).OrderBy(c => c.Created_at).ToListAsync(); ;
            if (task == null)
                return NotFound();
            return Ok(task);
        }
    }
}
