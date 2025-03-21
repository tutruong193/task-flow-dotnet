namespace taskflow_server.ViewModel
{
    public class TaskPostRequest
    {

        public string? Name { get; set; }
        public string Priority { get; set; }
        public string? Description { get; set; }
        public string? Assignee { get; set; }
        public string ? ReporterId { get; set; }
        public List<IFormFile>? Attachment { get; set; }

    }
}
