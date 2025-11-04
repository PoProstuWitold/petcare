package pl.witold.petcare.web.pets;

import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;
import pl.witold.petcare.pet.Pet;
import pl.witold.petcare.pet.PetService;
import pl.witold.petcare.user.User;
import pl.witold.petcare.user.UserService;

import java.util.List;

@Controller
@RequestMapping("/pets")
public class PetController {

    private final PetService petService;
    private final UserService userService;

    public PetController(PetService petService, UserService userService) {
        this.petService = petService;
        this.userService = userService;
    }

    @GetMapping
    public String listPets(Authentication authentication, Model model) {
        User currentUser = currentUser(authentication);
        List<Pet> pets = petService.findPetsForOwner(currentUser);

        if (!model.containsAttribute("petForm")) {
            model.addAttribute("petForm", new PetForm());
        }

        model.addAttribute("pets", pets);
        model.addAttribute("pageTitle", "My pets · PetCare");

        return "pets/index";
    }

    @PostMapping
    public String createPet(@Valid @ModelAttribute("petForm") PetForm form,
                            BindingResult binding,
                            Authentication authentication,
                            Model model,
                            RedirectAttributes redirectAttributes) {

        User currentUser = currentUser(authentication);

        if (binding.hasErrors()) {
            model.addAttribute("pets", petService.findPetsForOwner(currentUser));
            model.addAttribute("pageTitle", "My pets · PetCare");
            return "pets/index";
        }

        petService.createPetForOwner(
                currentUser,
                form.getName().trim(),
                form.getSpecies().trim(),
                form.getBreed() != null ? form.getBreed().trim() : null,
                form.getDateOfBirth(),
                form.getNotes()
        );

        redirectAttributes.addFlashAttribute("petCreated", true);
        return "redirect:/pets";
    }

    private User currentUser(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new IllegalStateException("Not authenticated");
        }
        String username = authentication.getName();
        return userService.findByUsernameOrThrow(username);
    }
}
