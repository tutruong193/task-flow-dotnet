using Microsoft.AspNetCore.Identity;
using System.ComponentModel.DataAnnotations;
using taskflow_server.Data.Interface;

namespace taskflow_server.Data.Entities
{
    public class User : IdentityUser, IDateTracking
    {
        public User()
        {
        }

        public User(string id, string name,
            string email, string phoneNumber, DateTime dob)
        {
            Id = id;
            Name = name;
            Email = email;
            PhoneNumber = phoneNumber;
            Dob = dob;
        }
        [Required]
        public string Name { get; set; }
        public string? Avatar { get; set; }
        public DateTime Dob { get; set; }
        public DateTime Created_at { get; set; }
        public DateTime? Updated_at { get; set; }
    }
}
