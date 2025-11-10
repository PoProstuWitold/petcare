package pl.witold.petcare.vet.mapper;

import pl.witold.petcare.dto.VetProfileResponseDto;
import pl.witold.petcare.user.User;
import pl.witold.petcare.vet.VetProfile;

import java.util.HashSet;

/**
 * Mapper responsible for converting between VetProfile entity and VetProfileResponseDto.
 */
public final class VetProfileMapper {

    private VetProfileMapper() {
        // Utility class
    }

    public static VetProfileResponseDto toDto(VetProfile profile) {
        User user = profile.getUser();

        return new VetProfileResponseDto(
                profile.getId(),
                user.getId(),
                user.getFullName(),
                user.getUsername(),
                user.getEmail(),
                profile.getBio(),
                profile.isAcceptsNewPatients(),
                profile.getAverageVisitLengthMinutes(),
                new HashSet<>(profile.getSpecializations())
        );
    }
}
