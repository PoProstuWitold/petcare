package pl.witold.petcare.visit;

import pl.witold.petcare.dto.VisitResponseDto;

/**
 * Mapper responsible for converting Visit entity to VisitResponseDto.
 */
public final class VisitMapper {

    private VisitMapper() {
        // Utility class
    }

    public static VisitResponseDto toDto(Visit visit) {
        return new VisitResponseDto(
                visit.getId(),
                visit.getPet().getId(),
                visit.getPet().getName(),
                visit.getVetProfile().getId(),
                visit.getVetProfile().getUser().getFullName(),
                visit.getDate(),
                visit.getStartTime(),
                visit.getEndTime(),
                visit.getStatus(),
                visit.getReason(),
                visit.getNotes()
        );
    }
}
