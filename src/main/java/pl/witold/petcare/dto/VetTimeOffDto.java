package pl.witold.petcare.dto;

import java.time.LocalDate;

/**
 * DTO for returning vet time-off periods in API responses.
 */
public record VetTimeOffDto(
        Long id,
        LocalDate startDate,
        LocalDate endDate,
        String reason
) {
}
