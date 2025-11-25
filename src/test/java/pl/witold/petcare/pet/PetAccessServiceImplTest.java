package pl.witold.petcare.pet;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import pl.witold.petcare.security.CurrentUserService;
import pl.witold.petcare.user.Role;
import pl.witold.petcare.user.User;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class PetAccessServiceImplTest {

    private CurrentUserService currentUserService;
    private PetAccessServiceImpl petAccessService;
    private User owner;
    private Pet pet;

    @BeforeEach
    void setUp() {
        currentUserService = Mockito.mock(CurrentUserService.class);
        petAccessService = new PetAccessServiceImpl(currentUserService);
        owner = mock(User.class);
        pet = mock(Pet.class);
        when(pet.getOwner()).thenReturn(owner);
        when(owner.getId()).thenReturn(10L);
    }

    @Test
    @DisplayName("Admin can view any pet")
    void adminCanView() {
        when(currentUserService.getCurrentUser()).thenReturn(owner); // identity doesn't matter
        when(currentUserService.hasRole(Role.ADMIN)).thenReturn(true);

        assertTrue(petAccessService.canView(pet));
    }

    @Test
    @DisplayName("Vet can modify any pet")
    void vetCanModify() {
        when(currentUserService.getCurrentUser()).thenReturn(owner);
        when(currentUserService.hasRole(Role.VET)).thenReturn(true);

        assertTrue(petAccessService.canModify(pet));
    }

    @Test
    @DisplayName("Owner can view own pet")
    void ownerCanViewOwnPet() {
        when(currentUserService.getCurrentUser()).thenReturn(owner);
        // no elevated roles
        when(currentUserService.hasRole(Role.ADMIN)).thenReturn(false);
        when(currentUserService.hasRole(Role.VET)).thenReturn(false);

        assertTrue(petAccessService.canView(pet));
    }

    @Test
    @DisplayName("Other user cannot modify pet")
    void otherUserCannotModifyPet() {
        User other = mock(User.class);
        when(other.getId()).thenReturn(99L);
        when(currentUserService.getCurrentUser()).thenReturn(other);
        when(currentUserService.hasRole(Role.ADMIN)).thenReturn(false);
        when(currentUserService.hasRole(Role.VET)).thenReturn(false);

        assertFalse(petAccessService.canModify(pet));
    }
}

