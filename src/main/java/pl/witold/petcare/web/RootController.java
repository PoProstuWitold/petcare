package pl.witold.petcare.web;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import pl.witold.petcare.status.HealthService;

import java.time.Instant;
import java.util.Map;

@Controller
public class RootController {

    private final HealthService healthService;

    public RootController(HealthService healthService) {
        this.healthService = healthService;
    }

    @GetMapping("/")
    public String home(Model model) {
        model.addAttribute("pageTitle", "PetCare - Home");
        return "home/index";
    }

    @GetMapping("/status")
    public String status(Model model) {
        Map<String, Object> overall = healthService.overall();
        Map<String, Object> live = healthService.liveness();
        Map<String, Object> ready = healthService.readiness();

        model.addAttribute("pageTitle", "PetCare - Status");
        model.addAttribute("timestamp", Instant.now().toString());

        model.addAttribute("overall", overall);
        model.addAttribute("liveness", live);
        model.addAttribute("readiness", ready);

        return "status/index";
    }
}