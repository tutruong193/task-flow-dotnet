using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using taskflow_server.Data.Interface;

namespace taskflow_server.Data.Entities
{
    public class Comment : IDateTracking
    {
        [Key]
        public Guid Id { get; set; }

        [Required]
        public string? Content { get; set; }

        [ForeignKey("Task")]
        public Guid TaskId { get; set; }

        [ForeignKey("User")]
        public Guid UserId { get; set; }

        [ForeignKey("Reply")]
        public Guid? ReplyId { get; set; }
        public DateTime Created_at { get ; set  ; }
        public DateTime? Updated_at { get  ; set  ; }
    }
}
