using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json;
using System.Security.Claims;
using taskflow_server.Data;
using taskflow_server.Data.Entities;
using taskflow_server.ViewModel;
using static System.Runtime.InteropServices.JavaScript.JSType;

namespace taskflow_server.Controllers
{
    public class ProjectsController : BaseController
    {
        private readonly AppDbContext _context;
        public ProjectsController(AppDbContext context)
        {
            _context = context;
        }
        [HttpPost]
            public async Task<IActionResult> PostProject([FromBody]ProjectCreateRequest request)
            {
            Console.WriteLine(JsonConvert.SerializeObject(request));
            if (request == null)
                {
                    return BadRequest("Request body cannot be null.");
                }

                if (string.IsNullOrEmpty(request.Name))
                {
                    return BadRequest("Name is required.");
                }

                var projectId = Guid.NewGuid(); // Tạo ID cho Project

                var project = new Project
                {
                    Id = projectId,
                    Name = request.Name,
                    Description = request.Description,
                    Status = "pending",
                    Created_at = DateTime.UtcNow,
                    Updated_at = DateTime.UtcNow
                };

                // Danh sách ProjectMember
                var projectMembers = new List<ProjectMember>();

                // Thêm Manager vào danh sách thành viên
                projectMembers.Add(new ProjectMember
                {
                    Id = Guid.NewGuid(),
                    ProjectId = projectId,
                    UserId = request.ManagerId,
                    Role = "Manager"
                });

                //Thêm từng Member vào danh sách
                if (request.Members != null)
                {
                    foreach (var memberId in request.Members)
                    {
                        if (Guid.TryParse(memberId, out Guid memberGuid))
                        {
                            projectMembers.Add(new ProjectMember
                            {
                                Id = Guid.NewGuid(),
                                ProjectId = projectId,
                                UserId = memberGuid,
                                Role = "Member"
                            });
                        }
                    }
                }
                // Danh sách ProjectMember
                var projectColumn = new List<Column>();
                projectColumn.Add(new Column
                {
                    Id = Guid.NewGuid(),
                    Name = "todo",
                    Position = 1,
                    FileRequired = false,
                    ProjectId = projectId
                });
                projectColumn.Add(new Column
                {
                    Id = Guid.NewGuid(),
                    Name = "progress",
                    Position = 2,
                    FileRequired = false,
                    ProjectId = projectId
                });
                projectColumn.Add(new Column
                {
                    Id = Guid.NewGuid(),
                    Name = "done",
                    Position = 3,
                    FileRequired = false,
                    ProjectId = projectId
                });
                _context.Columns.AddRange(projectColumn);
                _context.Projects.Add(project);
                _context.ProjectMembers.AddRange(projectMembers);

                var result = await _context.SaveChangesAsync();
                if (result > 0)
                {
                    return CreatedAtAction(nameof(GetById), new { id = project.Id }, request);
                }
                else
                {
                    return BadRequest("Failed to create project.");
                }
            }
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(string id)
        {
            var project = await _context.Projects.FindAsync(id);
            if (project == null)
                return NotFound();

            var projectReturn = new Project()
            {
                Id = project.Id,
                Name = project.Name,
                Description = project.Description,
                Status = project.Status,
                Created_at = project.Created_at,
                Updated_at = project.Updated_at

            };
            return Ok(projectReturn);
        }
        [HttpGet]
        public async Task<IActionResult> GetProject()
        {
            var project = _context.Projects;

            var projectReturn = await project.Select(u => new Project()
            {
                Id = u.Id,
                Name = u.Name,
                Status = u.Status,
                Created_at = u.Created_at,
                Updated_at = u.Updated_at,
                Description = u.Description,
            }).ToListAsync();
            return Ok(projectReturn);
        }
        [HttpGet("/managed/{managerId}")]
        public async Task<IActionResult> GetProjectByManageId(string managerId)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value; // Lấy userId từ JWT token

            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized("User không xác định.");
            }

            Guid userGuid;
            if (!Guid.TryParse(userId, out userGuid))
            {
                return BadRequest("UserId không hợp lệ.");
            }

            var managedProjects = await _context.Projects
                .Where(p => _context.ProjectMembers
                    .Any(pm => pm.ProjectId == p.Id && pm.UserId == userGuid && pm.Role == "Manager"))
                .ToListAsync();

            return Ok(managedProjects);
        }
    }
}
