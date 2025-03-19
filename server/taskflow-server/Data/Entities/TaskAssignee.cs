using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace taskflow_server.Data.Entities
{
    public class TaskAssignee
    {
        [Key]
        public Guid Id { get; set; }

        [ForeignKey("Task")]
        public Guid TaskId { get; set; }

        [ForeignKey("User")]
        public string? UserId { get; set; }
    }
}
