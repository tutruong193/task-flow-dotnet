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
            public string? UserId { get; set; } // Sử dụng string vì User kế thừa IdentityUser

            public string? Role { get; set; }
        }
    }
