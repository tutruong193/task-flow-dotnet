using FluentValidation;

namespace taskflow_server.ViewModel
{
    public class LoginRequestValidator : AbstractValidator<LoginRequest>
    {
        public LoginRequestValidator()
        {
            RuleFor(x => x.Email)
                .NotEmpty().WithMessage("Enter the email.")
                .EmailAddress().WithMessage("Invalid email.");

            RuleFor(x => x.Password)
                .NotEmpty().WithMessage("Enter the password.")
                .MinimumLength(6).WithMessage("At least 6 characters in password.");
        }
    }
}
