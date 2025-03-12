using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace taskflow_server.Data.Entities
{
    public class ProjectMember
    {
        [Key]
        public Guid Id { get; set; }

        [ForeignKey("Project")]
        public Guid ProjectId { get; set; }

        [ForeignKey("User")]
        public Guid UserId { get; set; }

        public string? Role { get; set; }
    }
}
