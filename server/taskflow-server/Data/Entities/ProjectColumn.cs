using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using taskflow_server.Data.Interface;

namespace taskflow_server.Data.Entities
{
    public class ProjectColumn : IDateTracking
    {
        [Key]
        public Guid Id { get; set; }

        [ForeignKey("Project")]
        public Guid ProjectId { get; set; }

        [Required]
        public string? Name { get; set; } // To Do, In Progress, Done

        public int Position { get; set; }

        public bool FileRequired { get; set; } // Yêu cầu đính kèm file?
        public DateTime Created_at { get  ; set  ; }
        public DateTime? Updated_at { get  ; set  ; }
    }
}
