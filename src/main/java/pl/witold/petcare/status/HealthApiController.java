package pl.witold.petcare.status;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.Map;

@RestController
@RequestMapping("/api/health")
public class HealthApiController {

    private final HealthService healthService;

    public HealthApiController(HealthService healthService) {
        this.healthService = healthService;
    }

    @GetMapping
    public Map<String, Object> overall() {
        Map<String, Object> payload = healthService.overall();
        return Map.of(
                "timestamp", Instant.now().toString(),
                "status", payload.get("status"),
                "details", payload.get("details")
        );
    }

    @GetMapping("/liveness")
    public Map<String, Object> liveness() {
        Map<String, Object> payload = healthService.liveness();
        return Map.of(
                "timestamp", Instant.now().toString(),
                "status", payload.get("status"),
                "details", payload.get("details")
        );
    }

    @GetMapping("/readiness")
    public Map<String, Object> readiness() {
        Map<String, Object> payload = healthService.readiness();
        return Map.of(
                "timestamp", Instant.now().toString(),
                "status", payload.get("status"),
                "details", payload.get("details")
        );
    }

    @GetMapping("/ping")
    public Map<String, Object> ping() {
        return Map.of(
                "status", "OK",
                "service", "petcare",
                "timestamp", Instant.now().toString()
        );
    }
}
