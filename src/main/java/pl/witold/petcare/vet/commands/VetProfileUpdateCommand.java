package pl.witold.petcare.vet.commands;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import pl.witold.petcare.vet.VetSpecialization;

import java.util.Set;

/**
 * Command used for creating or updating a vet profile for the current vet.
 */
public record VetProfileUpdateCommand(

        @Size(max = 255, message = "Bio cannot exceed 255 characters")
        String bio,

        @NotNull(message = "acceptsNewPatients flag is required")
        Boolean acceptsNewPatients,

        @NotNull(message = "Average visit length is required")
        @Min(value = 5, message = "Average visit length must be at least 5 minutes")
        @Max(value = 240, message = "Average visit length cannot exceed 240 minutes")
        Integer averageVisitLengthMinutes,

        Set<VetSpecialization> specializations
) {
}
