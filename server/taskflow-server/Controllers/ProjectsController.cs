using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json;
using taskflow_server.Data;
using taskflow_server.Data.Entities;
using taskflow_server.ViewModel;

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
        public async Task<IActionResult> PostProject([FromBody] ProjectCreateRequest request)
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
                Updated_at = DateTime.UtcNow,
                Startdate_at = request.Startdate_at,
                Enddate_At = request.Enddate_At
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
                    projectMembers.Add(new ProjectMember
                    {
                        Id = Guid.NewGuid(),
                        ProjectId = projectId,
                        UserId = memberId,
                        Role = "Member"
                    });

                }
            }
            // Danh sách ProjectMember
            var projectColumn = new List<Column>();
            projectColumn.Add(new Column
            {
                Id = Guid.NewGuid(),
                Name = "to do",
                Position = 1,
                ProjectId = projectId
            });
            projectColumn.Add(new Column
            {
                Id = Guid.NewGuid(),
                Name = "in progress",
                Position = 2,
                ProjectId = projectId
            });
            projectColumn.Add(new Column
            {
                Id = Guid.NewGuid(),
                Name = "done",
                Position = 3,
                ProjectId = projectId
            });
            _context.Columns.AddRange(projectColumn);
            _context.Projects.Add(project);
            _context.ProjectMembers.AddRange(projectMembers);

            var result = await _context.SaveChangesAsync();
            if (result > 0)
            {
                return Ok();
            }
            else
            {
                return BadRequest("Failed to create project.");
            }
        }
        [HttpGet("{projectid}")]
        public async Task<IActionResult> GetById(string projectid)
        {
            Guid projectGuid;
            if (!Guid.TryParse(projectid, out projectGuid))
            {
                return BadRequest("Project không hợp lệ.");
            }
            var project = await _context.Projects.FindAsync(projectGuid);
            if (project == null)
                return NotFound();
            var members = await _context.ProjectMembers
                .Where(pm => pm.ProjectId == project.Id)
                .ToListAsync();
            var projectReturn = new ProjectGetRequest()
            {
                Id = project.Id,
                Name = project.Name,
                Description = project.Description,
                Status = project.Status,
                Created_at = project.Created_at,
                Updated_at = project.Updated_at,
                Members = members
            };
            return Ok(projectReturn);
        }
        [HttpGet]
        public async Task<IActionResult> GetProject()
        {
            var projectReturn = await _context.Projects.Select(u => new ProjectGetRequest()
            {
                Id = u.Id,
                Name = u.Name,
                Status = u.Status,
                Created_at = u.Created_at,
                Updated_at = u.Updated_at,
                Description = u.Description,
            }).ToListAsync();
            foreach (var project in projectReturn)
            {
                var members = await _context.ProjectMembers
                .Where(pm => pm.ProjectId == project.Id)
                .ToListAsync();
                project.Members = members;
            }
            return Ok(projectReturn);
        }
        [HttpGet("managed/{managerId}")]
        public async Task<IActionResult> GetProjectByManageId(string managerId)
        {

            if (string.IsNullOrEmpty(managerId))
            {
                return Unauthorized("User không xác định.");
            }

            var managedProjects = await _context.Projects
              .Where(p => _context.ProjectMembers
                  .Any(pm => pm.ProjectId == p.Id && pm.UserId == managerId && pm.Role == "Manager"))
              .Select(p => new
              {
                  p.Id,
                  p.Name,
                  p.Description,
                  p.Status,
                  p.Created_at,
                  p.Updated_at,
                  p.Startdate_at,
                  p.Enddate_At,
                  Members = _context.ProjectMembers
                      .Where(pm => pm.ProjectId == p.Id)
                      .Select(pm => new
                      {
                          pm.UserId,
                          pm.Role
                      }).ToList()
              })
              .ToListAsync();

            return Ok(managedProjects);
        }
        [HttpDelete("{id}")]

        public async Task<IActionResult> DeleteProject(string id)
        {
            if (!Guid.TryParse(id, out Guid projectId))
            {
                return BadRequest("Id không hợp lệ.");
            }

            var project = await _context.Projects.FindAsync(projectId);
            if (project == null)
            {
                return NotFound();
            }

            _context.Projects.Remove(project);
            await _context.SaveChangesAsync();
            return Ok();

        }
        [HttpPut("{projectid}")]
        public async Task<IActionResult> PutProject([FromBody] Project request, string projectid)
        {
            if (!Guid.TryParse(projectid, out Guid projectId))
            {
                return BadRequest("Id không hợp lệ.");
            }

            var project = await _context.Projects.FindAsync(projectId);
            if (project == null)
            {
                return NotFound();
            }

            // Cập nhật thông tin project
            project.Name = request.Name;
            project.Description = request.Description;
            project.Status = request.Status;
            project.Updated_at = DateTime.UtcNow;
            project.Enddate_At = request.Enddate_At;
            project.Startdate_at = request.Startdate_at;

            _context.Projects.Update(project);
            await _context.SaveChangesAsync();

            return Ok(project);

        }
        [HttpPost("{projectid}/members")]
        public async Task<IActionResult> AddMemberToProject(string projectid, [FromBody] ProjectMember request)
        {
            if (!Guid.TryParse(projectid, out Guid projectId))
            {
                return BadRequest("Id không hợp lệ.");
            }

            var project = await _context.Projects.FindAsync(projectId);
            if (project == null)
            {
                return NotFound();
            }
            var existingMember = await _context.ProjectMembers
                .FirstOrDefaultAsync(pm => pm.ProjectId == projectId && pm.UserId == request.UserId);

            if (existingMember != null)
            {
                return BadRequest("Thành viên đã tồn tại trong dự án.");
            }
            var newMember = new ProjectMember
            {
                Id = Guid.NewGuid(),
                ProjectId = projectId,
                UserId = request.UserId,
                Role = request.Role,
            };

            _context.ProjectMembers.Add(newMember);
            await _context.SaveChangesAsync();

            return Ok(newMember);
        }
        [HttpDelete("{projectid}/members/{userId}")]
        public async Task<IActionResult> DeleteMemberFromProject(string projectid, string userId)
        {
            if (!Guid.TryParse(projectid, out Guid projectId))
            {
                return BadRequest("ProjectId is not valid.");
            }

            var project = await _context.Projects.FindAsync(projectId);
            if (project == null)
            {
                return NotFound("ProjectId is not exsisting");
            }

            var member = await _context.ProjectMembers
                .FirstOrDefaultAsync(pm => pm.ProjectId == projectId && pm.UserId == userId);

            if (member == null)
            {
                return NotFound("The user is not in the project");
            }

            _context.ProjectMembers.Remove(member);
            await _context.SaveChangesAsync();

            return Ok("Successfully");
        }
    }
}
