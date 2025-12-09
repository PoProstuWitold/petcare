package pl.witold.petcare.pet;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;
import pl.witold.petcare.security.CurrentUserService;
import pl.witold.petcare.user.Role;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PetServiceAccessRulesTest {

    @Mock
    private PetRepository petRepository;
    @Mock
    private CurrentUserService currentUserService;
    @Mock
    private PetAccessService petAccessService;

    @InjectMocks
    private PetServiceImpl petService;

    @Test
    @DisplayName("getAll: only ADMIN or VET is allowed")
    void getAllRestricted() {
        when(currentUserService.hasRole(Role.ADMIN)).thenReturn(false);
        when(currentUserService.hasRole(Role.VET)).thenReturn(false);
        assertThrows(AccessDeniedException.class, () -> petService.getAll());
    }

    @Test
    @DisplayName("getById: throws when not found; otherwise checks view access")
    void getByIdChecksAccess() {
        when(petRepository.findByIdWithOwner(1L)).thenReturn(Optional.empty());
        assertThrows(pl.witold.petcare.exceptions.PetNotFoundException.class, () -> petService.getById(1L));

        Pet pet = mock(Pet.class);
        when(petRepository.findByIdWithOwner(2L)).thenReturn(Optional.of(pet));
        // should call access check
        petService.getById(2L);
        verify(petAccessService).checkCanView(pet);
    }
}

