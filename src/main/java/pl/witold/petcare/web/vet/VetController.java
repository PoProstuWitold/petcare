package pl.witold.petcare.web;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import pl.witold.petcare.pet.Pet;
import pl.witold.petcare.pet.PetRepository;

import java.util.List;

@Controller
@RequestMapping("/vet")
@RequiredArgsConstructor
public class VetController {

    private final PetRepository petRepository;

    @GetMapping
    public String showVetPanel(Model model) {
        List<Pet> pets = petRepository.findAllWithOwnerOrdered();

        model.addAttribute("pets", pets);
        return "vet/index";
    }
}
