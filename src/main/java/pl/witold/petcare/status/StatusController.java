package pl.witold.petcare.status;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import pl.witold.petcare.dto.HealthStatusResponse;

import java.time.Instant;
import java.util.Map;
import java.util.Objects;

@Tag(
        name = "Status",
        description = "Application health and status"
)
@RestController
@RequestMapping("/api/status")
public class StatusController {

    private final StatusService statusService;

    public StatusController(StatusService statusService) {
        this.statusService = statusService;
    }

    @Operation(
            summary = "Get overall application health",
            description = "Returns the current overall health status of the PetCare application, "
                    + "including timestamp, global status and details from underlying health checks."
    )
    @ApiResponse(
            responseCode = "200",
            description = "Application is running and health status was retrieved successfully",
            content = @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = HealthStatusResponse.class)
            )
    )
    @GetMapping("/health")
    public HealthStatusResponse overall() {
        Map<String, Object> payload = statusService.overall();

        String status = Objects.requireNonNull(
                (String) payload.get("status"),
                "Status key must exist in StatusService.overall() response"
        );
        Object details = Objects.requireNonNull(
                payload.get("details"),
                "Details key must exist in StatusService.overall() response"
        );

        return new HealthStatusResponse(
                Instant.now().toString(),
                status,
                details
        );
    }
}
