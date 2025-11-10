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
import pl.witold.petcare.pet.commands.PetCreateCommand;
import pl.witold.petcare.pet.commands.PetUpdateCommand;
import pl.witold.petcare.security.CurrentUserService;
import pl.witold.petcare.user.Role;
import pl.witold.petcare.user.User;
import pl.witold.petcare.user.UserRepository;

import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class PetServiceImplTest {

    @Mock private PetRepository petRepository;
    @Mock private UserRepository userRepository;
    @Mock private CurrentUserService currentUserService;
    @Mock private PetAccessService petAccessService;

    @InjectMocks private PetServiceImpl petService;

    @Test
    @DisplayName("Regular user cannot create pet for another owner")
    void userCannotCreateForAnotherOwner() {
        User current = mock(User.class);
        when(current.getId()).thenReturn(1L);
        when(currentUserService.getCurrentUser()).thenReturn(current);
        when(currentUserService.hasRole(Role.ADMIN)).thenReturn(false);
        when(currentUserService.hasRole(Role.VET)).thenReturn(false);

        PetCreateCommand cmd = new PetCreateCommand(2L, "Luna", Species.DOG, Sex.FEMALE, null, null, null, null, null);
        assertThrows(AccessDeniedException.class, () -> petService.create(cmd));
    }

    @Test
    @DisplayName("Admin can reassign owner on update")
    void adminCanReassignOnUpdate() {
        when(currentUserService.hasRole(Role.ADMIN)).thenReturn(true);
        when(currentUserService.hasRole(Role.VET)).thenReturn(false);
        User admin = mock(User.class);
        when(admin.getId()).thenReturn(99L);
        when(currentUserService.getCurrentUser()).thenReturn(admin);

        Pet existing = new Pet();
        User oldOwner = mock(User.class);
        when(oldOwner.getId()).thenReturn(10L);
        existing.setOwner(oldOwner);
        when(petRepository.findByIdWithOwner(5L)).thenReturn(Optional.of(existing));
        doNothing().when(petAccessService).checkCanModify(existing);

        User newOwner = mock(User.class);
        when(newOwner.getId()).thenReturn(11L);
        when(userRepository.findById(11L)).thenReturn(Optional.of(newOwner));

        PetUpdateCommand cmd = new PetUpdateCommand(11L, "Luna", Species.DOG, Sex.FEMALE, null, LocalDate.now(), null, null, null);
        when(petRepository.save(any(Pet.class))).thenAnswer(inv -> inv.getArgument(0));

        Pet updated = petService.update(5L, cmd);
        assertEquals(11L, updated.getOwner().getId());
    }
}
