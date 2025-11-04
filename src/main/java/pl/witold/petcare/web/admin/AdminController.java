package pl.witold.petcare.web.admin;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import pl.witold.petcare.user.User;
import pl.witold.petcare.user.UserRepository;

import java.util.List;

@Controller
@RequestMapping("/admin")
public class AdminController {

    private final UserRepository users;

    public AdminController(UserRepository users) {
        this.users = users;
    }

    @GetMapping
    public String index(Model model) {
        List<User> allUsers = users.findAll();

        model.addAttribute("users", allUsers);
        model.addAttribute("pageTitle", "Admin · PetCare");

        return "admin/index";
    }
}
