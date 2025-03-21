using System.ComponentModel.DataAnnotations.Schema;

namespace taskflow_server.ViewModel
{
    public class CommentPostRequest
    {
        public string? Content { get; set; }
        public string UserId { get; set; }
        [ForeignKey("Reply")]
        public Guid? ReplyId { get; set; }
    }
}
