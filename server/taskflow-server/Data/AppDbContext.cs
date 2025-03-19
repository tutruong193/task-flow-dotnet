using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Microsoft.VisualStudio.Web.CodeGenerators.Mvc.Templates.General;
using taskflow_server.Data.Entities;

namespace taskflow_server.Data
{
    public class AppDbContext : IdentityDbContext<User>
    {
        public AppDbContext(DbContextOptions options) : base(options)
        {
        }
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<IdentityRole>().Property(x => x.Id).HasMaxLength(50).IsUnicode(false);
            modelBuilder.Entity<User>().Property(x => x.Id).HasMaxLength(50).IsUnicode(false);

            // Quan hệ giữa TaskModel và Project
            modelBuilder.Entity<TaskModel>()
                .HasOne<Project>()
                .WithMany()
                .HasForeignKey(t => t.ProjectId)
                .OnDelete(DeleteBehavior.Restrict); // Tránh vòng lặp

            // Quan hệ giữa TaskModel và Column
            modelBuilder.Entity<TaskModel>()
                .HasOne<Column>()
                .WithMany()
                .HasForeignKey(t => t.ColumnId)
                .OnDelete(DeleteBehavior.Restrict);

            // Quan hệ giữa Attachment và Task
            modelBuilder.Entity<Attachment>()
                .HasOne<TaskModel>()
                .WithMany()
                .HasForeignKey(a => a.TaskId)
                .OnDelete(DeleteBehavior.Cascade);

            // Quan hệ giữa Comment và Task/User
            modelBuilder.Entity<Comment>()
                .HasOne<TaskModel>()
                .WithMany()
                .HasForeignKey(c => c.TaskId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Comment>()
                .HasOne<User>()
                .WithMany()
                .HasForeignKey(c => c.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            // Quan hệ tự tham chiếu trong Comment (Reply)
            modelBuilder.Entity<Comment>()
                .HasOne<Comment>()
                .WithMany()
                .HasForeignKey(c => c.ReplyId)
                .OnDelete(DeleteBehavior.Restrict);

            // Quan hệ giữa ProjectMember và Project/User
            modelBuilder.Entity<ProjectMember>()
                .HasOne<Project>()
                .WithMany()
                .HasForeignKey(pm => pm.ProjectId)
                .OnDelete(DeleteBehavior.Restrict); // Tránh lỗi cascade path

            modelBuilder.Entity<ProjectMember>()
                .HasOne<User>()
                .WithMany()
                .HasForeignKey(pm => pm.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            // Quan hệ giữa TaskAssignee và Task/User
            modelBuilder.Entity<TaskAssignee>()
                .HasOne<TaskModel>()
                .WithMany()
                .HasForeignKey(ta => ta.TaskId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<TaskAssignee>()
                .HasOne<User>()
                .WithMany()
                .HasForeignKey(ta => ta.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            // Quan hệ giữa Column và Project
            modelBuilder.Entity<Column>()
                .HasOne<Project>()
                .WithMany()
                .HasForeignKey(c => c.ProjectId)
                .OnDelete(DeleteBehavior.Restrict); // Tránh lỗi vòng lặp
        }

        public DbSet<Project> Projects { get; set; }
        public DbSet<ProjectMember> ProjectMembers { get; set; }
        public DbSet<Column> Columns { get; set; }
        public DbSet<TaskModel> Tasks { get; set; }
        public DbSet<TaskAssignee> TaskAssignees { get; set; }
        public DbSet<Comment> Comments { get; set; }
        public DbSet<Attachment> Attachments { get; set; }

    }
}
