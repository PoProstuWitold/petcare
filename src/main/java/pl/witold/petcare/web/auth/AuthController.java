package pl.witold.petcare.web.auth;

import jakarta.validation.Valid;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;
import pl.witold.petcare.user.UserService;
import pl.witold.petcare.web.auth.dto.RegisterRequest;

@Controller
@RequestMapping("/auth")
public class AuthController {

    private final UserService users;

    public AuthController(UserService users) {
        this.users = users;
    }

    @GetMapping("/login")
    public String loginPage(Model model) {
        model.addAttribute("pageTitle", "PetCare - Login");
        return "auth/login";
    }

    @GetMapping("/register")
    public String registerForm(Model model) {
        model.addAttribute("pageTitle", "PetCare - Register");
        model.addAttribute("form", new RegisterRequest());
        return "auth/register";
    }

    @PostMapping("/register")
    public String register(@ModelAttribute("form") @Valid RegisterRequest form,
                           BindingResult binding,
                           Model model) {
        if (!form.getPassword().equals(form.getConfirmPassword())) {
            binding.rejectValue("confirmPassword", "password.mismatch", "Hasła nie są takie same");
        }
        if (binding.hasErrors()) {
            model.addAttribute("pageTitle", "Rejestracja · PetCare");
            return "auth/register";
        }
        try {
            users.register(form.getUsername().trim(), form.getEmail().trim(), form.getPassword());
        } catch (IllegalArgumentException ex) {
            String msg = ex.getMessage();
            if (msg != null && msg.contains("Username")) {
                binding.rejectValue("username", "username.taken", "Nazwa użytkownika zajęta");
            } else if (msg != null && msg.contains("Email")) {
                binding.rejectValue("email", "email.used", "Email już użyty");
            } else {
                binding.reject("register.failed", "Rejestracja nie powiodła się");
            }
            model.addAttribute("pageTitle", "Rejestracja · PetCare");
            return "auth/register";
        }
        return "redirect:/auth/login?registered";
    }
}
