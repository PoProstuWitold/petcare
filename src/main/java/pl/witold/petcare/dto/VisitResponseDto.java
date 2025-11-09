package pl.witold.petcare.dto;

import pl.witold.petcare.visit.VisitStatus;

import java.time.LocalDate;
import java.time.LocalTime;

/**
 * DTO for returning visit data in API responses.
 */
public record VisitResponseDto(
        Long id,
        Long petId,
        String petName,
        Long vetProfileId,
        String vetFullName,
        LocalDate date,
        LocalTime startTime,
        LocalTime endTime,
        VisitStatus status,
        String reason,
        String notes
) {}
