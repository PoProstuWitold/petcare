package pl.witold.petcare.pet;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.springframework.security.access.AccessDeniedException;
import pl.witold.petcare.dto.PetImportDto;
import pl.witold.petcare.security.CurrentUserService;
import pl.witold.petcare.user.Role;
import pl.witold.petcare.user.User;
import pl.witold.petcare.user.UserRepository;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class PetImportTest {

    @Mock private PetRepository petRepository;
    @Mock private UserRepository userRepository;
    @Mock private CurrentUserService currentUserService;
    @Mock private PetAccessService petAccessService; // not used in import but required for ctor

    @InjectMocks private PetServiceImpl petService;

    @Test
    @DisplayName("Import creates new pets with owner assignment")
    void importCreatesNewPets() {
        User current = mock(User.class);
        when(current.getId()).thenReturn(5L);
        when(currentUserService.getCurrentUser()).thenReturn(current);
        when(currentUserService.hasRole(Role.ADMIN)).thenReturn(false);
        when(currentUserService.hasRole(Role.VET)).thenReturn(false);
        when(userRepository.findById(5L)).thenReturn(Optional.of(current));

        PetImportDto dto1 = new PetImportDto("Luna", Species.DOG, Sex.FEMALE, "Beagle", null, 2020, 12.0, "Friendly");
        PetImportDto dto2 = new PetImportDto("Max", Species.CAT, Sex.MALE, "", null, null, null, null);

        when(petRepository.save(any(Pet.class))).thenAnswer(inv -> inv.getArgument(0));

        List<Pet> created = petService.importForOwner(5L, List.of(dto1, dto2));
        assertEquals(2, created.size());
        assertTrue(created.stream().allMatch(p -> p.getOwner().getId().equals(5L)));
        assertEquals("Luna", created.get(0).getName());
        assertEquals("Max", created.get(1).getName());
    }

    @Test
    @DisplayName("Import denied when user tries to import for another owner")
    void importDeniedForAnotherOwner() {
        User current = mock(User.class);
        when(current.getId()).thenReturn(5L);
        when(currentUserService.getCurrentUser()).thenReturn(current);
        when(currentUserService.hasRole(Role.ADMIN)).thenReturn(false);
        when(currentUserService.hasRole(Role.VET)).thenReturn(false);

        PetImportDto dto = new PetImportDto("Luna", Species.DOG, Sex.FEMALE, null, null, null, null, null);
        assertThrows(AccessDeniedException.class, () -> petService.importForOwner(6L, List.of(dto)));
    }
}

