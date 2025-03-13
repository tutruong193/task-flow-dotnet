namespace taskflow_server.ViewModel
{
    public class ProjectCreateRequest
    {
        public Guid Id { get; set; }
        public string? Name { get; set; }

        public string? Description { get; set; }

        public string? Status { get; set; } // pending, in progress, completed
        public DateTime Created_at { get; set; }
        public DateTime? Updated_at { get; set; }
        public Guid ManagerId { get; set; }
        public List<String> Members { get; set; }
    }
}
