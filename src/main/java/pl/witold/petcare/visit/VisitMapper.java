package pl.witold.petcare.visit;

import pl.witold.petcare.dto.PetResponseDto;
import pl.witold.petcare.dto.VisitResponseDto;
import pl.witold.petcare.pet.Pet;
import pl.witold.petcare.user.User;
import pl.witold.petcare.vet.VetProfile;

/**
 * Mapper responsible for converting between Visit entity and VisitResponseDto.
 */
public final class VisitMapper {

    private VisitMapper() {
        // Utility class
    }

    public static VisitResponseDto toDto(Visit visit) {
        Pet pet = visit.getPet();
        VetProfile vetProfile = visit.getVetProfile();
        User owner = pet.getOwner();
        User vetUser = vetProfile.getUser();

        PetResponseDto petDto = new PetResponseDto(
                pet.getId(),
                owner.getId(),
                owner.getFullName(),
                pet.getName(),
                pet.getSpecies(),
                pet.getSex(),
                pet.getBreed(),
                pet.getBirthDate(),
                pet.getBirthYear(),
                pet.getWeight(),
                pet.getNotes()
        );

        return new VisitResponseDto(
                visit.getId(),
                petDto,
                vetProfile.getId(),
                vetUser.getId(),
                vetUser.getFullName(),
                visit.getDate(),
                visit.getStartTime(),
                visit.getEndTime(),
                visit.getStatus(),
                visit.getReason(),
                visit.getNotes()
        );
    }
}
