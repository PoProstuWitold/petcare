package pl.witold.petcare.dto;

import java.time.DayOfWeek;
import java.time.LocalTime;

/**
 * DTO for returning a single vet schedule entry.
 */
public record VetScheduleEntryDto(
        DayOfWeek dayOfWeek,
        LocalTime startTime,
        LocalTime endTime,
        Integer slotLengthMinutes
) {
}
