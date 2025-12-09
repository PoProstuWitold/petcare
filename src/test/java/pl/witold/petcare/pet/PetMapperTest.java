package pl.witold.petcare.pet;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import pl.witold.petcare.dto.PetImportDto;
import pl.witold.petcare.dto.PetResponseDto;
import pl.witold.petcare.user.Role;
import pl.witold.petcare.user.User;

import java.time.LocalDate;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.assertEquals;

class PetMapperTest {

    @Test
    @DisplayName("toDto and fromImportDto preserve key fields")
    void mappingRoundTrip() {
        User owner = new User("Owner Name", "owner1", "owner@local", "hash", Set.of(Role.USER));
        Pet pet = new Pet(owner, "Sara", Species.DOG, Sex.FEMALE, "Mixed", LocalDate.of(2021, 5, 10), 2021, 9.2, "notes");

        PetResponseDto dto = PetMapper.toDto(pet);
        assertEquals("Sara", dto.name());
        assertEquals(Species.DOG, dto.species());
        assertEquals(Sex.FEMALE, dto.sex());
        assertEquals(2021, dto.birthYear());
        assertEquals(9.2, dto.weight());
        assertEquals(owner.getFullName(), dto.ownerFullName());

        PetImportDto importDto = PetMapper.toImportDto(pet);
        Pet recreated = PetMapper.fromImportDto(owner, importDto);
        assertEquals(pet.getName(), recreated.getName());
        assertEquals(pet.getSpecies(), recreated.getSpecies());
        assertEquals(pet.getSex(), recreated.getSex());
        assertEquals(pet.getBirthYear(), recreated.getBirthYear());
        assertEquals(pet.getWeight(), recreated.getWeight());
    }
}

