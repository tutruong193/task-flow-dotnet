namespace taskflow_server.ViewModel
{
    public class UserVm
    {
        public string Id { get; set; }

        public string UserName { get; set; }

        public string Email { get; set; }

        public string PhoneNumber { get; set; }

        public string Name { get; set; }

        public DateTime Dob { get; set; }
        public string Role { get; set; }
        public string Avatar { get; set; }
        public DateTime CreateDate_At { get; set; }
        public DateTime? Updated_At { get; set; }
    }
}
