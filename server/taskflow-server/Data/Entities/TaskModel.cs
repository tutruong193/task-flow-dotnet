﻿using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using taskflow_server.Data.Interface;

namespace taskflow_server.Data.Entities
{
    public class TaskModel : IDateTracking
    {
        [Key]
        public Guid Id { get; set; }

        [Required]
        public string? Title { get; set; }

        public string? Description { get; set; }

        public string? Status { get; set; } // pending, in progress, completed

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [ForeignKey("ProjectColumn")]
        public Guid ColumnId { get; set; }
        public DateTime Created_at { get  ; set  ; }
        public DateTime? Updated_at { get  ; set  ; }
    }
}
