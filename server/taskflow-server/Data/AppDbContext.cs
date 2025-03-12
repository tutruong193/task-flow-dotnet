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
            modelBuilder.Entity<ProjectMember>()
                .HasOne<Project>()
                .WithMany(p => p.Members)
                .HasForeignKey(pm => pm.ProjectId);

            modelBuilder.Entity<ProjectColumn>()
                .HasOne<Project>()
                .WithMany()
                .HasForeignKey(pc => pc.ProjectId);

            modelBuilder.Entity<TaskModel>()
                .HasOne<ProjectColumn>()
                .WithMany()
                .HasForeignKey(t => t.ColumnId);
        }
        public DbSet<Project> Projects { get; set; }
        public DbSet<ProjectMember> ProjectMembers { get; set; }
        public DbSet<ProjectColumn> ProjectColumns { get; set; }
        public DbSet<TaskModel> Tasks { get; set; }
        public DbSet<TaskAssignee> TaskAssignees { get; set; }
        public DbSet<Comment> Comments { get; set; }
        public DbSet<Attachment> Attachments { get; set; }

    }
}
