package pl.witold.petcare.vet.mapper;

import pl.witold.petcare.dto.VetTimeOffDto;
import pl.witold.petcare.vet.VetTimeOff;

/**
 * Mapper responsible for converting between VetTimeOff entity and VetTimeOffDto.
 */
public final class VetTimeOffMapper {

    private VetTimeOffMapper() {
        // Utility class
    }

    public static VetTimeOffDto toDto(VetTimeOff timeOff) {
        return new VetTimeOffDto(
                timeOff.getId(),
                timeOff.getStartDate(),
                timeOff.getEndDate(),
                timeOff.getReason()
        );
    }
}
