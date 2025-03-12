using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using taskflow_server.Data.Interface;

namespace taskflow_server.Data.Entities
{
    public class Attachment : IDateTracking
    {
        [Key]
        public Guid Id { get; set; }

        [Required]
        public string? FileName { get; set; }

        [Required]
        public string? FilePath { get; set; }

        public string? FileType { get; set; }

        public long FileSize { get; set; }

        [ForeignKey("Task")]
        public Guid TaskId { get; set; }
        public DateTime Created_at { get  ; set  ; }
        public DateTime? Updated_at { get  ; set  ; }
    }
}
