using Azure.Core;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using taskflow_server.Data;
using taskflow_server.Data.Entities;
using taskflow_server.ViewModel;
using System.Net.Http.Headers;
using taskflow_server.Services;
namespace taskflow_server.Controllers
{
    public class TasksController : BaseController
    {
        private readonly AppDbContext _context;
        private readonly IStorageService _storageService;
        public TasksController(AppDbContext context, IStorageService storageService)
        {
            _context = context;
            _storageService = storageService;
        }
        [HttpPost("project/{projectId}")]
        public async Task<IActionResult> PostTask([FromBody] TaskPostRequest request, string projectId)
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
                Enddate_at = request.Enddate_At,
                ProjectId = projectGuid,
            };
            task.ColumnId = await _context.Columns
                .Where(c => c.ProjectId == projectGuid && c.Name == "todo")
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
        [HttpPut("{taskId}")]
        public async Task<IActionResult> PutTask([FromBody] TaskModel request, string taskId)
        {
            var task = await _context.Tasks.FindAsync(taskId);
            if (task == null)
                return NotFound();

            task.Title = request.Title;
            task.Description = request.Description;
            task.Updated_at = DateTime.Now;

            await _context.SaveChangesAsync();
            return NoContent();
        }
        [HttpPut("{taskId}/status/{columnId}")]
        public async Task<IActionResult> ChangeStatusTask(string taskId, string columnId)
        {
            var task = await _context.Tasks.FindAsync(Guid.Parse(taskId));
            if (task == null)
                return NotFound();

            task.ColumnId = Guid.Parse(columnId);
            task.Updated_at = DateTime.Now;

            await _context.SaveChangesAsync();
            return Ok();
        }
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTask(string id)
        {
            if (!Guid.TryParse(id, out Guid taskId))
            {
                return BadRequest("Id không hợp lệ.");
            }

            var task = await _context.Tasks.FindAsync(taskId);
            if (task == null)
            {
                return NotFound();
            }

            _context.Tasks.Remove(task);
            await _context.SaveChangesAsync();

            var taskReturn = new TaskVm()
            {
                Id = task.Id,
                Title = task.Title,
                Description = task.Description,
                Created_at = task.Created_at,
                Updated_at = task.Updated_at
            };

            return Ok(taskReturn);
        }

        #region Assignee
        [HttpPost("{taskId}/assignee")]
        public async Task<IActionResult> AddAssigneeToTask(string taskId, [FromBody] TaskAssignee request)
        {
            if (!Guid.TryParse(taskId, out Guid parsedTaskId))
            {
                return BadRequest("TaskId is not valid.");
            }

            var task = await _context.Tasks.FindAsync(parsedTaskId);
            if (task == null)
            {
                return NotFound("Task is not exsisting");
            }
            var existingAssignee = await _context.TaskAssignees
                .FirstOrDefaultAsync(ta => ta.TaskId == parsedTaskId && ta.UserId == request.UserId);

            if (existingAssignee != null)
            {
                return BadRequest("This member is assigned to task");
            }

            var newAssignee = new TaskAssignee
            {
                Id = Guid.NewGuid(),
                TaskId = parsedTaskId,
                UserId = request.UserId,
            };

            _context.TaskAssignees.Add(newAssignee);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Người thực hiện đã được thêm vào task.", assignee = newAssignee });
        }
        [HttpDelete("{taskId}/assignee/{userId}")]
        public async Task<IActionResult> RemoveAssginFromTask(string taskId, string userId)
        {
            if (!Guid.TryParse(taskId, out Guid parsedTaskId))
            {
                return BadRequest("TaskId ís not valid.");
            }

            var task = await _context.Tasks.FindAsync(parsedTaskId);
            if (task == null)
            {
                return NotFound("Task is not exsisting");
            }

            var assignee = await _context.TaskAssignees
                .FirstOrDefaultAsync(ta => ta.TaskId == parsedTaskId && ta.UserId == userId);

            if (assignee == null)
            {
                return NotFound("The member is not assigned to task");
            }

            _context.TaskAssignees.Remove(assignee);
            await _context.SaveChangesAsync();

            return Ok("Delete sucessfully");
        }
        #endregion
        #region Comment
        [HttpPost("{taskId}/comments")]
        public async Task<IActionResult> PostComment(string taskId, [FromBody] Comment request)
        {
            if (!Guid.TryParse(taskId, out Guid parsedTaskId))
            {
                return BadRequest("TaskId is not valid.");
            }

            var task = await _context.Tasks.FindAsync(parsedTaskId);
            if (task == null)
            {
                return NotFound("Task is not exsisting");
            }
            if (string.IsNullOrWhiteSpace(request.Content))
            {
                return BadRequest("Nội dung bình luận không được để trống.");
            }
            var comment = new Comment
            {
                Id = Guid.NewGuid(),
                TaskId = parsedTaskId,
                UserId = request.UserId,
                Content = request.Content,
                Created_at = DateTime.UtcNow,
                Updated_at = DateTime.UtcNow,
                ReplyId = request.ReplyId,
            };
            await _context.Comments.AddAsync(comment);
            await _context.SaveChangesAsync();
            return Ok("Comment added successfully");
        }
        [HttpPatch("{taskId}/comments/{commentId}")]
        public async Task<IActionResult> PatchComment(string taskId, [FromBody] Comment request, string commentId)
        {
            if (!Guid.TryParse(taskId, out Guid parsedTaskId) || !Guid.TryParse(commentId, out Guid parseCommentId))
            {
                return BadRequest("TaskId or CommentId are not valid.");
            }

            var task = await _context.Tasks.FindAsync(parsedTaskId);
            if (task == null)
            {
                return NotFound("Task is not exsisting");
            }
            var comment = await _context.Comments.FindAsync(parseCommentId);
            if (comment == null || comment.TaskId != parsedTaskId)
            {
                return NotFound("Bình luận không tồn tại hoặc không thuộc task này.");
            }
            if (string.IsNullOrWhiteSpace(request.Content))
            {
                return BadRequest("Content is not blank.");
            }
            comment.Content = request.Content;
            comment.Updated_at = DateTime.UtcNow;
            _context.Comments.Update(comment);
            await _context.SaveChangesAsync();


            return Ok("Comment updated successfully");
        }
        [HttpDelete("{taskId}/comments/{commentId}")]
        public async Task<IActionResult> DeleteComment(string taskId, string commentId)
        {
            if (!Guid.TryParse(taskId, out Guid parsedTaskId) || !Guid.TryParse(commentId, out Guid parseCommentId))
            {
                return BadRequest("TaskId or CommentId are not valid.");
            }

            var task = await _context.Tasks.FindAsync(parsedTaskId);
            if (task == null)
            {
                return NotFound("Task is not exsisting");
            }
            var comment = await _context.Comments.FindAsync(parseCommentId);
            if (comment == null || comment.TaskId != parsedTaskId)
            {
                return NotFound("Bình luận không tồn tại hoặc không thuộc task này.");
            }
            _context.Comments.Remove(comment);
            await _context.SaveChangesAsync();

            return Ok("Comment deleted successfully");
        }
        #endregion
        #region Attachment


        [HttpDelete("{taskId}/attachments/{attachmentId}")]
        public async Task<IActionResult> DeleteAttachment(string attachmentId)
        {
            var attachment = await _context.Attachments.FindAsync(Guid.Parse(attachmentId));
            if (attachment == null)
                return BadRequest();


            var webHostEnvironment = HttpContext.RequestServices.GetRequiredService<IWebHostEnvironment>();
            var filePath = Path.Combine(webHostEnvironment.WebRootPath, attachment.FilePath.TrimStart('/'));
            if (System.IO.File.Exists(filePath))
            {
                System.IO.File.Delete(filePath);
            }
            _context.Attachments.Remove(attachment);
            var result = await _context.SaveChangesAsync();
            if (result > 0)
            {
                return Ok();
            }
            return BadRequest();
        }
        [HttpPost("{taskId}/attachments")]
        public async Task<IActionResult> PostAttachment(string taskId, [FromForm] AttachmentVm file)
        {
            try
            {
                if (!Guid.TryParse(taskId, out Guid parsedTaskId))
                {
                    return BadRequest("TaskId is not valid.");
                }

                var task = await _context.Tasks.FindAsync(parsedTaskId);
                if (task == null)
                {
                    return NotFound("Task is not exsisting");
                }
                //var column = await _context.Columns.FindAsync(task.ColumnId);
                ////if (column.FileRequired == false)
                ////{
                ////    return BadRequest("This task is not required to attach a file");
                ////}
                var attachmentEntity = await SaveFile(taskId, file.File);
                _context.Attachments.Add(attachmentEntity);
                await _context.SaveChangesAsync();
                return Ok("Attachment added successfully");
            }
            catch (Exception ex)
            {
                // Log lỗi
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
        private async Task<Attachment> SaveFile(string taskId, IFormFile file)
        {
            var originalFileName = ContentDispositionHeaderValue.Parse(file.ContentDisposition).FileName.Trim('"');
            var fileName = $"{Guid.NewGuid()}-{originalFileName}";
            await _storageService.SaveFileAsync(file.OpenReadStream(), fileName);
            var attachmentEntity = new Attachment()
            {
                FileName = fileName,
                FilePath = _storageService.GetFileUrl(fileName),
                FileSize = file.Length,
                FileType = Path.GetExtension(fileName),
                TaskId = Guid.Parse(taskId),
                Created_at = DateTime.UtcNow,
                Updated_at = DateTime.UtcNow,
                Id = Guid.NewGuid(),
            };
            return attachmentEntity;
        }
        #endregion
    }
}
