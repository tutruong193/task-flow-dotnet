using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using taskflow_server.Data;
using taskflow_server.Data.Entities;
using taskflow_server.ViewModel;

namespace taskflow_server.Controllers
{
    public class UsersController : BaseController
    {
        private readonly UserManager<User> _userManager;
        private readonly RoleManager<IdentityRole> _roleManager;
        private readonly AppDbContext _context;
        public UsersController(UserManager<User> userManager,
            RoleManager<IdentityRole> roleManager,
            AppDbContext context)
        {
            _userManager = userManager;
            _roleManager = roleManager;
            _context = context;
        }
        [HttpPost]
        public async Task<IActionResult> PostUser(UserCreateRequest request)
        {
            var user = new User
            {
                Id = Guid.NewGuid().ToString(),
                Email = request.Email,
                Dob = DateTime.Parse(request.Dob),
                UserName = request.UserName,
                Name = request.Name,
                PhoneNumber = request.PhoneNumber,
                Created_at = DateTime.Now,
                Updated_at = DateTime.Now
            };
            var result = await _userManager.CreateAsync(user, request.Password);
            if (result.Succeeded)
            {
                return CreatedAtAction(nameof(GetById), new { id = user.Id }, request);
            }
            else
            {
                return BadRequest();
            }
        }
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(string id)
        {
            var user = await _userManager.FindByIdAsync(id);
            if (user == null)
                return NotFound();

            var userVm = new UserVm()
            {
                Id = user.Id,
                UserName = user.UserName,
                Dob = user.Dob,
                Email = user.Email,
                PhoneNumber = user.PhoneNumber,
                Name = user.Name,
                CreateDate_At = user.Created_at,
                Updated_At = user.Updated_at,
            };
            return Ok(userVm);
        }
        [HttpGet]
        public async Task<IActionResult> GetUsers()
        {
            var users = _userManager.Users;

            var uservms = await users.Select(u => new UserVm()
            {
                Id = u.Id,
                UserName = u.UserName,
                Dob = u.Dob,
                Email = u.Email,
                PhoneNumber = u.PhoneNumber,
                Name = u.Name,
                CreateDate_At = u.Created_at,
                Updated_At = u.Updated_at
            }).ToListAsync();

            return Ok(uservms);
        }
        [HttpPut("{id}")]
        public async Task<IActionResult> PutUser(string id, [FromBody] UserCreateRequest request)
        {
            var user = await _userManager.FindByIdAsync(id);
            if (user == null)
                return NotFound();

            user.Name = request.Name;
            user.Dob = DateTime.Parse(request.Dob);
            user.Updated_at = DateTime.Now;

            var result = await _userManager.UpdateAsync(user);

            if (result.Succeeded)
            {
                return NoContent();
            }
            return BadRequest();
        }
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteUser(string id)
        {
            var user = await _userManager.FindByIdAsync(id);
            if (user == null)
                return NotFound();

            var result = await _userManager.DeleteAsync(user);

            if (result.Succeeded)
            {
                var uservm = new UserVm()
                {
                    Id = user.Id,
                    UserName = user.UserName,
                    Dob = user.Dob,
                    Email = user.Email,
                    PhoneNumber = user.PhoneNumber,
                    Name = user.Name,
                };
                return Ok(uservm);
            }
            return BadRequest();
        }
    }
}
