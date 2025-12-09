package pl.witold.petcare.vet.commands;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.time.DayOfWeek;
import java.time.LocalTime;

/**
 * Command describing a single weekly schedule entry for a vet.
 */
public record VetScheduleEntryCommand(

        @NotNull(message = "Day of week is required")
        DayOfWeek dayOfWeek,

        @NotNull(message = "Start time is required")
        LocalTime startTime,

        @NotNull(message = "End time is required")
        LocalTime endTime,

        @NotNull(message = "Slot length is required")
        @Min(value = 5, message = "Slot length must be at least 5 minutes")
        @Max(value = 240, message = "Slot length cannot exceed 240 minutes")
        Integer slotLengthMinutes
) {
}
