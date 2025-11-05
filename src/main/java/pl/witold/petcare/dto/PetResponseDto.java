package pl.witold.petcare.dto;

import pl.witold.petcare.pet.Sex;
import pl.witold.petcare.pet.Species;

import java.time.LocalDate;

/**
 * DTO for returning pet data in API responses.
 */
public record PetResponseDto(
        Long id,
        Long ownerId,
        String ownerFullName,
        String name,
        Species species,
        Sex sex,
        String breed,
        LocalDate birthDate,
        Integer birthYear,
        Double weight,
        String notes
) {}
