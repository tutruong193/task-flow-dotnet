using taskflow_server.Data.Entities;

namespace taskflow_server.ViewModel
{
    public class ProjectGetRequest
    {
        public Guid Id { get; set; }
        public string? Name { get; set; }

        public string? Description { get; set; }

        public string? Status { get; set; }
        public DateTime Created_at { get; set; }
        public DateTime? Updated_at { get; set; }
        public ICollection<ProjectMember> Members { get; set; }
    }
}
