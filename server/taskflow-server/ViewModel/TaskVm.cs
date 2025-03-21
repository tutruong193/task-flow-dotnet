using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using taskflow_server.Data.Entities;

namespace taskflow_server.ViewModel
{
    public class TaskVm
    {
        public Guid Id { get; set; }

        public string? Name { get; set; }
        public string Priority { get; set; }
        public string? Description { get; set; }
        public string ReporterId { get; set; }
        public DateTime Created_at { get; set; }
        public DateTime? Updated_at { get; set; }
        public TaskAssignee Assignee { get; set; }
    }
}
