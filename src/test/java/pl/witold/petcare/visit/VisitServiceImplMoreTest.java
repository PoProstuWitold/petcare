package pl.witold.petcare.visit;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;
import pl.witold.petcare.dto.VisitResponseDto;
import pl.witold.petcare.pet.Pet;
import pl.witold.petcare.pet.PetAccessService;
import pl.witold.petcare.pet.PetService;
import pl.witold.petcare.security.CurrentUserService;
import pl.witold.petcare.user.Role;
import pl.witold.petcare.user.User;
import pl.witold.petcare.vet.VetProfile;
import pl.witold.petcare.vet.VetScheduleEntry;
import pl.witold.petcare.vet.service.VetProfileService;
import pl.witold.petcare.vet.service.VetScheduleService;
import pl.witold.petcare.visit.commands.VisitCreateCommand;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class VisitServiceImplMoreTest {

    @Mock private VisitRepository visitRepository;
    @Mock private PetService petService;
    @Mock private PetAccessService petAccessService;
    @Mock private VetProfileService vetProfileService;
    @Mock private VetScheduleService vetScheduleService;
    @Mock private CurrentUserService currentUserService;

    @InjectMocks private VisitServiceImpl visitService;

    @Test
    @DisplayName("getById: admin can view any visit")
    void getByIdAdminAllowed() {
        Visit visit = mock(Visit.class);
        when(visitRepository.findByIdWithRelations(1L)).thenReturn(Optional.of(visit));
        when(currentUserService.hasAnyRole(Role.ADMIN, Role.VET)).thenReturn(true);

        Visit result = visitService.getById(1L);
        assertSame(visit, result);
    }

    @Test
    @DisplayName("getById: owner can view own visit and others are denied")
    void getByIdOwnerAccessControl() {
        Visit visit = mock(Visit.class);
        Pet pet = mock(Pet.class);
        User owner = mock(User.class);
        when(owner.getId()).thenReturn(42L);
        when(pet.getOwner()).thenReturn(owner);
        when(visit.getPet()).thenReturn(pet);
        when(visitRepository.findByIdWithRelations(5L)).thenReturn(Optional.of(visit));

        // Owner allowed
        when(currentUserService.hasAnyRole(Role.ADMIN, Role.VET)).thenReturn(false);
        when(currentUserService.getCurrentUserId()).thenReturn(42L);
        assertSame(visit, visitService.getById(5L));

        // Other user denied
        when(currentUserService.getCurrentUserId()).thenReturn(99L);
        assertThrows(AccessDeniedException.class, () -> visitService.getById(5L));
    }

    @Test
    @DisplayName("updateVisitFields: updates only provided fields and returns DTO")
    void updateVisitFieldsUpdatesProvided() {
        Visit visit = mock(Visit.class);
        // Provide nested relations for VisitMapper
        Pet pet = mock(Pet.class);
        User owner = mock(User.class);
        when(owner.getId()).thenReturn(10L);
        when(owner.getFullName()).thenReturn("Owner Name");
        when(pet.getId()).thenReturn(20L);
        when(pet.getOwner()).thenReturn(owner);
        when(visit.getPet()).thenReturn(pet);
        VetProfile vetProfile = mock(VetProfile.class);
        User vetUser = mock(User.class);
        when(vetUser.getId()).thenReturn(30L);
        when(vetUser.getFullName()).thenReturn("Vet User");
        when(vetProfile.getId()).thenReturn(40L);
        when(vetProfile.getUser()).thenReturn(vetUser);
        when(visit.getVetProfile()).thenReturn(vetProfile);
        when(visit.getId()).thenReturn(55L);
        when(visit.getDate()).thenReturn(LocalDate.now().plusDays(3));
        when(visit.getStartTime()).thenReturn(LocalTime.of(9, 0));
        when(visit.getEndTime()).thenReturn(LocalTime.of(9, 30));
        when(visit.getStatus()).thenReturn(VisitStatus.SCHEDULED);

        when(visitRepository.findByIdWithRelations(55L)).thenReturn(Optional.of(visit));

        VisitResponseDto dto = visitService.updateVisitFields(55L, "New reason", null);

        verify(visit).setReason("New reason");
        verify(visit, never()).setNotes(any());
        assertEquals(55L, dto.id());
        assertEquals(VisitStatus.SCHEDULED, dto.status());
    }

    @Test
    @DisplayName("createVisit: rejects non-aligned start time w.r.t. slot length")
    void createVisitRejectsNonAlignedStart() {
        Pet pet = mock(Pet.class);
        when(petService.getById(1L)).thenReturn(pet);
        doNothing().when(petAccessService).checkCanModify(pet);
        VetProfile vetProfile = mock(VetProfile.class);
        when(vetProfileService.getById(2L)).thenReturn(vetProfile);
        when(vetProfile.getId()).thenReturn(2L);

        LocalDate date = LocalDate.now().plusDays(1);
        VetScheduleEntry entry = mock(VetScheduleEntry.class);
        when(entry.getDayOfWeek()).thenReturn(date.getDayOfWeek());
        when(entry.getStartTime()).thenReturn(LocalTime.of(9,0));
        when(entry.getEndTime()).thenReturn(LocalTime.of(12,0));
        when(entry.getSlotLengthMinutes()).thenReturn(30);
        when(vetScheduleService.getScheduleForVetProfile(2L)).thenReturn(List.of(entry));

        // Non-aligned time 09:10 should be rejected in findScheduleEntry
        VisitCreateCommand cmd = new VisitCreateCommand(1L, 2L, date, LocalTime.of(9,10), "Reason", null);
        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> visitService.createVisit(cmd));
        assertTrue(ex.getMessage().toLowerCase().contains("outside"));
    }
}

