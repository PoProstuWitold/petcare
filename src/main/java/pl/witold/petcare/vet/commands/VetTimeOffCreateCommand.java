package pl.witold.petcare.vet.commands;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

/**
 * Command used for creating a new time-off period for the current vet.
 */
public record VetTimeOffCreateCommand(

        @NotNull(message = "Start date is required")
        LocalDate startDate,

        @NotNull(message = "End date is required")
        LocalDate endDate,

        @NotNull(message = "Reason is required")
        @Size(max = 255, message = "Reason cannot exceed 255 characters")
        String reason
) {}
