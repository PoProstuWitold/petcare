package pl.witold.petcare.dto;

import pl.witold.petcare.vet.VetSpecialization;

import java.util.Set;

/**
 * DTO for returning vet profile data in API responses.
 */
public record VetProfileResponseDto(
        Long id,
        Long userId,
        String fullName,
        String username,
        String email,
        String bio,
        boolean acceptsNewPatients,
        Integer averageVisitLengthMinutes,
        Set<VetSpecialization> specializations
) {
}
