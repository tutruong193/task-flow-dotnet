using Azure.Core;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using taskflow_server.Data;
using taskflow_server.Data.Entities;
using taskflow_server.ViewModel;
using System.Net.Http.Headers;
using taskflow_server.Services;
using Microsoft.IdentityModel.Tokens;
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
        public async Task<IActionResult> PostTask([FromForm] TaskPostRequest request, string projectId)
        {
            Guid projectGuid;
            if (!Guid.TryParse(projectId, out projectGuid))
            {
                return BadRequest("Project không hợp lệ.");
            }

            var task = new TaskModel
            {
                Id = Guid.NewGuid(),
                Name = request.Name,
                Description = request.Description,
                ProjectId = projectGuid,
                Priority = request.Priority,
                ReporterId = request.ReporterId,
                Created_at = DateTime.UtcNow,
                Updated_at = DateTime.UtcNow
            };

            task.ColumnId = await _context.Columns
                .Where(c => c.ProjectId == projectGuid && c.Name == "to do")
                .Select(c => (Guid?)c.Id)
                .FirstOrDefaultAsync() ?? Guid.Empty;

            if (task.ColumnId == Guid.Empty)
            {
                return BadRequest("Không tìm thấy ColumnId cho Project.");
            }

            _context.Tasks.Add(task);

            if (!string.IsNullOrEmpty(request.Assignee))
            {
                var assignee = new TaskAssignee
                {
                    Id = Guid.NewGuid(),
                    TaskId = task.Id,
                    UserId = request.Assignee
                };
                _context.TaskAssignees.Add(assignee);
            }
            await _context.SaveChangesAsync();
            if (request.Attachment != null && request.Attachment.Count > 0)
            {
                foreach (var file in request.Attachment)
                {
                    if (file != null)
                    {
                        var attachmentEntity = await SaveFile(task.Id.ToString(), file);
                        _context.Attachments.Add(attachmentEntity);
                    }
                }
                await _context.SaveChangesAsync();
            }

            await _context.SaveChangesAsync();
            return Ok();
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
            var assignee = await _context.TaskAssignees.FirstOrDefaultAsync(c => c.TaskId == Guid.Parse(id));
            var taskReturn = new TaskVm()
            {
                Id = task.Id,
                Name = task.Name,
                Priority = task.Priority,
                Description = task.Description,
                Assignee = assignee,
                Created_at = task.Created_at,
                Updated_at = task.Updated_at,
                ReporterId = task.ReporterId
               
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
            var tasks = await _context.Tasks
                .Where(t => t.ProjectId == projectGuid)
                .OrderBy(t => t.Created_at)
                .Select(t => new
                {
                    t.Id,
                    t.Name,
                    t.Description,
                    t.Created_at,
                    t.Priority,
                    t.ColumnId,
                    t.ProjectId,
                    Assignee = _context.TaskAssignees.Where(ta => ta.TaskId == t.Id).FirstOrDefault()
                })
                .ToListAsync();
            if (tasks == null)
                return NotFound();
            return Ok(tasks);
        }
        [HttpPut("{taskId}")]
        public async Task<IActionResult> PutTask([FromBody] TaskModel request, string taskId)
        {
            var task = await _context.Tasks.FindAsync(taskId);
            if (task == null)
                return NotFound();

            task.Name = request.Name;
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
            var column = await _context.Columns.FindAsync(task.ColumnId);
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

            return Ok();
        }

        #region Assignee
        [HttpPost("{taskId}/assignee/{userId}")]
        public async Task<IActionResult> AddAssigneeToTask(string taskId, string userId)
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
                .FirstOrDefaultAsync(ta => ta.TaskId == parsedTaskId && ta.UserId == userId);

            if (existingAssignee != null)
            {
                return BadRequest("This member is assigned to task");
            }

            var newAssignee = new TaskAssignee
            {
                Id = Guid.NewGuid(),
                TaskId = parsedTaskId,
                UserId = userId,
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
        #region 
        [HttpGet("{taskId}/comments")]
        public async Task<IActionResult> GetCommentByTaskId(string taskId)
        {
            if (!Guid.TryParse(taskId, out Guid parsedTaskId))
            {
                return BadRequest("TaskId không hợp lệ.");
            }

            var comments = await _context.Comments
                .Where(c => c.TaskId == parsedTaskId)
                .OrderBy(c => c.Created_at)
                .ToListAsync();
            return Ok(comments);
        }
        [HttpPost("{taskId}/comments")]
        public async Task<IActionResult> PostComment(string taskId, [FromBody] CommentPostRequest request)
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
            if (!Guid.TryParse(taskId, out Guid parsedTaskId) || !Guid.TryParse(commentId, out Guid parsedCommentId))
            {
                return BadRequest("TaskId or CommentId are not valid.");
            }

            var task = await _context.Tasks.FindAsync(parsedTaskId);
            if (task == null)
            {
                return NotFound("Task does not exist.");
            }

            var comment = await _context.Comments.FirstOrDefaultAsync(c => c.Id == parsedCommentId);

            if (comment == null || comment.TaskId != parsedTaskId)
            {
                return NotFound("Comment does not exist or does not belong to this task.");
            }

            // Kiểm tra comment có phải là comment gốc hay không
            bool isRootComment = comment.ReplyId == null;

            if (isRootComment)
            {
                // Nếu là comment gốc, tìm tất cả reply của nó
                var replyComments = await _context.Comments
                    .Where(c => c.ReplyId == parsedCommentId)
                    .ToListAsync();

                if (replyComments.Any())
                {
                    _context.Comments.RemoveRange(replyComments);
                }
            }

            // Xóa comment chính
            _context.Comments.Remove(comment);

            await _context.SaveChangesAsync();
            return Ok("Comment deleted successfully.");
        }


        #endregion
        #region Attachment
        [HttpGet("{taskId}/attachments")]
        public async Task<IActionResult> GetAttachmentByTaskId(string taskId)
        {
            try
            {
                // Kiểm tra xem taskId có hợp lệ không
                if (!Guid.TryParse(taskId, out Guid parsedTaskId))
                {
                    return BadRequest("TaskId is not valid.");
                }

                // Kiểm tra xem task có tồn tại không
                var task = await _context.Tasks.FindAsync(parsedTaskId);
                if (task == null)
                {
                    return NotFound("Task does not exist.");
                }

                // Lấy danh sách các file đính kèm của task
                var attachments = await _context.Attachments
                    .Where(a => a.TaskId == parsedTaskId)
                    .Select(a => new
                    {
                        a.Id,
                        a.FileName,
                        a.FilePath,
                        a.FileSize,
                        a.FileType,
                        a.Created_at,
                    })
                    .ToListAsync();

                // Trả về danh sách các file đính kèm
                return Ok(attachments);
            }
            catch (Exception ex)
            {
                // Log lỗi và trả về thông báo lỗi
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // Hàm kiểm tra xem file có phải là ảnh không
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
        [HttpGet("attachments/download/{fileName}")]
        public IActionResult DownloadFile(string fileName)
        {
            if (string.IsNullOrEmpty(fileName))
            {
                return BadRequest("Tên tệp không hợp lệ.");
            }

            string filePath = Path.Combine("wwwroot", "user-attachments", fileName);

            if (!System.IO.File.Exists(filePath))
            {
                return NotFound("Tệp không tồn tại.");
            }

            var contentType = GetContentType(filePath);
            var fileBytes = System.IO.File.ReadAllBytes(filePath);

            return File(fileBytes, contentType, fileName);
        }
        private string GetContentType(string path)
        {
            var provider = new Microsoft.AspNetCore.StaticFiles.FileExtensionContentTypeProvider();
            if (!provider.TryGetContentType(path, out var contentType))
            {
                contentType = "application/octet-stream";
            }
            return contentType;
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
        [HttpGet("attachments/{fileName}")]
        public IActionResult GetAttachment(string fileName)
        {
            var filePath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "user-attachments", fileName);

            if (!System.IO.File.Exists(filePath))
            {
                return NotFound("File không tồn tại.");
            }

            var fileBytes = System.IO.File.ReadAllBytes(filePath);
            var contentType = "application/octet-stream";

            // Lấy loại MIME phù hợp nếu có
            var provider = new Microsoft.AspNetCore.StaticFiles.FileExtensionContentTypeProvider();
            if (provider.TryGetContentType(filePath, out string mimeType))
            {
                contentType = mimeType;
            }

            return File(fileBytes, contentType);
        }
        #endregion
    }
}
