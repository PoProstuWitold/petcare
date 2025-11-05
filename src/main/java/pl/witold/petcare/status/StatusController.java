package pl.witold.petcare.status;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.Map;

@RestController
@RequestMapping("/api/status")
public class StatusController {

    private final StatusService statusService;

    public StatusController(StatusService statusService) {
        this.statusService = statusService;
    }

    @GetMapping("/health")
    public Map<String, Object> overall() {
        Map<String, Object> payload = statusService.overall();
        return Map.of(
                "timestamp", Instant.now().toString(),
                "status", payload.get("status"),
                "details", payload.get("details")
        );
    }
}
