package pl.witold.petcare.pet;

import pl.witold.petcare.dto.PetImportDto;
import pl.witold.petcare.dto.PetResponseDto;
import pl.witold.petcare.user.User;

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

    public static PetImportDto toImportDto(Pet pet) {
        return new PetImportDto(
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

    public static Pet fromImportDto(User owner, PetImportDto dto) {
        return new Pet(
                owner,
                dto.name(),
                dto.species(),
                dto.sex(),
                dto.breed(),
                dto.birthDate(),
                dto.birthYear(),
                dto.weight(),
                dto.notes()
        );
    }
}
