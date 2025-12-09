package pl.witold.petcare.visit;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import pl.witold.petcare.dto.PetResponseDto;
import pl.witold.petcare.dto.VisitResponseDto;
import pl.witold.petcare.pet.Pet;
import pl.witold.petcare.pet.Sex;
import pl.witold.petcare.pet.Species;
import pl.witold.petcare.user.Role;
import pl.witold.petcare.user.User;
import pl.witold.petcare.vet.VetProfile;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

class VisitMapperTest {

    @Test
    @DisplayName("toDto maps nested owner and vet user correctly")
    void mapsNestedCorrectly() {
        User owner = new User("Owner Name", "owner1", "owner@local", "hash", Set.of(Role.USER));
        Pet pet = new Pet(owner, "Sara", Species.DOG, Sex.FEMALE, null, null, 2021, 9.2, null);

        // Mock VetProfile and its user
        VetProfile profile = Mockito.mock(VetProfile.class);
        User vetUser = new User("Vet User", "vet1", "vet@local", "hash", Set.of(Role.VET));
        Mockito.when(profile.getId()).thenReturn(3L);
        Mockito.when(profile.getUser()).thenReturn(vetUser);

        Visit visit = new Visit(pet, profile, LocalDate.now().plusDays(1), LocalTime.of(10, 0), LocalTime.of(10, 30), "Reason", null);

        VisitResponseDto dto = VisitMapper.toDto(visit);
        assertNotNull(dto);
        PetResponseDto petDto = dto.pet();
        assertNotNull(petDto);
        assertEquals("Owner Name", petDto.ownerFullName());
        assertEquals("Sara", petDto.name());
        assertEquals("Vet User", dto.vetFullName());
        assertEquals(LocalTime.of(10, 0), dto.startTime());
        assertEquals(LocalTime.of(10, 30), dto.endTime());
    }
}
