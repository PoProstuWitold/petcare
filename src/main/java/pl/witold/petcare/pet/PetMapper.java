package pl.witold.petcare.pet;

import pl.witold.petcare.dto.PetResponseDto;

/**
 * Mapper responsible for converting between Pet entity and PetResponseDto.
 */
public final class PetMapper {

    private PetMapper() {
        // Utility class
    }

    public static PetResponseDto toDto(Pet pet) {
        return new PetResponseDto(
                pet.getId(),
                pet.getOwner().getId(),
                pet.getOwner().getFullName(),
                pet.getName(),
                pet.getSpecies(),
                pet.getSex(),
                pet.getBreed(),
                pet.getBirthDate(),
                pet.getBirthYear(),
                pet.getWeight(),
                pet.getNotes()
        );
    }
}
