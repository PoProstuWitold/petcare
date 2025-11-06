package pl.witold.petcare.vet.mapper;

import pl.witold.petcare.dto.VetScheduleEntryDto;
import pl.witold.petcare.vet.VetScheduleEntry;

/**
 * Mapper responsible for converting between VetScheduleEntry entity and VetScheduleEntryDto.
 */
public final class VetScheduleMapper {

    private VetScheduleMapper() {
        // Utility class
    }

    public static VetScheduleEntryDto toDto(VetScheduleEntry entry) {
        return new VetScheduleEntryDto(
                entry.getDayOfWeek(),
                entry.getStartTime(),
                entry.getEndTime(),
                entry.getSlotLengthMinutes()
        );
    }
}
