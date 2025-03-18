using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace taskflow_server.ViewModel
{
    public class TaskVm
    {
        public Guid Id { get; set; }

        public string? Title { get; set; }

        public string? Description { get; set; }

        public string? Status { get; set; } 
        public DateTime Created_at { get; set; }
        public DateTime? Updated_at { get; set; }
    }
}
