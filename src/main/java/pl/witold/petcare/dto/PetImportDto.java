package pl.witold.petcare.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import pl.witold.petcare.pet.Sex;
import pl.witold.petcare.pet.Species;

import java.time.LocalDate;

/**
 * DTO used for exporting and importing pets without IDs/owner info.
 * On import, new IDs are generated and pets are assigned to the current user.
 */
public record PetImportDto(
        @NotBlank(message = "Name cannot be empty")
        @Size(max = 64, message = "Name cannot exceed 64 characters")
        String name,

        @NotNull(message = "Species must be provided")
        Species species,

        Sex sex,

        @Size(max = 64, message = "Breed cannot exceed 64 characters")
        String breed,

        LocalDate birthDate,

        Integer birthYear,

        @Positive(message = "Weight must be positive")
        Double weight,

        @Size(max = 512, message = "Notes cannot exceed 512 characters")
        String notes
) {}

