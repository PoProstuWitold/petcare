package pl.witold.petcare.dto;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Overall application health status response")
public record HealthStatusResponse(

        @Schema(description = "Timestamp when the health status was generated", example = "2025-11-10T21:37:12.123Z")
        String timestamp,

        @Schema(description = "Overall health status of the application", example = "UP")
        String status,

        @Schema(description = "Detailed health information for subsystems (database, disk, etc.)")
        Object details
) {
}
