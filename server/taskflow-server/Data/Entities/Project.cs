using System.ComponentModel.DataAnnotations;
using taskflow_server.Data.Interface;

namespace taskflow_server.Data.Entities
{
    public class Project : IDateTracking
    {
        [Key]
        public Guid Id { get; set; }

        [Required]
        public string? Name { get; set; }

        public string? Description { get; set; }

        public string? Status { get; set; } // pending, in progress, completed
        public DateTime Startdate_at { get; set; }
        public DateTime Enddate_At { get; set; }
        public DateTime Created_at { get  ; set  ; }
        public DateTime? Updated_at { get  ; set  ; }
    }
}
