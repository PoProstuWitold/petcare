package pl.witold.petcare.visit.commands;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;
import java.time.LocalTime;

/**
 * Command used for creating a new visit.
 */
public record VisitCreateCommand(
        @NotNull(message = "Pet id is required")
        Long petId,

        @NotNull(message = "Vet profile id is required")
        Long vetProfileId,

        @NotNull(message = "Visit date is required")
        LocalDate date,

        @NotNull(message = "Start time is required")
        LocalTime startTime,

        @NotNull(message = "Reason is required")
        @Size(max = 255, message = "Reason cannot exceed 255 characters")
        String reason,

        @Size(max = 1024, message = "Notes cannot exceed 1024 characters")
        String notes
) {
}
