using Microsoft.AspNetCore.Identity;
using taskflow_server.Data.Entities;

namespace taskflow_server.Data
{
    public class DbInitializer
    {
        private readonly AppDbContext _context;
        private readonly UserManager<User> _userManager;
        private readonly RoleManager<IdentityRole> _roleManager;
        private readonly string AdminRoleUserName = "Admin";
        private readonly string MemberRoleUserName = "Member";
        private readonly string ManagerRoleUserName = "Manager";
        public DbInitializer(AppDbContext context,
          UserManager<User> userManager,
          RoleManager<IdentityRole> roleManager)
        {
            _context = context;
            _userManager = userManager;
            _roleManager = roleManager;
        }
        public async Task Seed()
        {   //role
            if (!_roleManager.Roles.Any())
            {
                await _roleManager.CreateAsync(new IdentityRole
                {
                    Id = AdminRoleUserName,
                    Name = AdminRoleUserName,
                    NormalizedName = AdminRoleUserName.ToUpper(),
                });
                await _roleManager.CreateAsync(new IdentityRole
                {
                    Id = MemberRoleUserName,
                    Name = MemberRoleUserName,
                    NormalizedName = MemberRoleUserName.ToUpper(),
                });
                await _roleManager.CreateAsync(new IdentityRole
                {
                    Id = ManagerRoleUserName,
                    Name = ManagerRoleUserName,
                    NormalizedName = ManagerRoleUserName.ToUpper(),
                });
            }


            //member
            if (!_userManager.Users.Any())
            {
                var resultAdmin = await _userManager.CreateAsync(new User
                {
                    Id = Guid.NewGuid().ToString(),
                    UserName = "admin",
                    Name = "admin",
                    Email = "admin@gmail.com",
                    LockoutEnabled = false
                }, "Admin@123");
                var resultManager = await _userManager.CreateAsync(new User
                {
                    Id = Guid.NewGuid().ToString(),
                    Name = "manager",
                    UserName = "manager",
                    Email = "manager@gmail.com",
                    LockoutEnabled = false
                }, "Manager@123");
                var resultMember = await _userManager.CreateAsync(new User
                {
                    Id = Guid.NewGuid().ToString(),
                    Name = "member",
                    UserName = "member",
                    Email = "member@gmail.com",
                    LockoutEnabled = false
                }, "Member@123");
                if (resultAdmin.Succeeded && resultMember.Succeeded && resultManager.Succeeded)
                {
                    var admin = await _userManager.FindByNameAsync("admin");
                    var manager = await _userManager.FindByNameAsync("manager");
                    var member = await _userManager.FindByNameAsync("member");
                    await _userManager.AddToRoleAsync(admin, AdminRoleUserName);
                    await _userManager.AddToRoleAsync(manager, ManagerRoleUserName);
                    await _userManager.AddToRoleAsync(member, MemberRoleUserName);
                }
            }
        }
    }
}
