package pl.witold.petcare.visit;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import pl.witold.petcare.dto.VisitResponseDto;
import pl.witold.petcare.exceptions.ResourceNotFoundException;
import pl.witold.petcare.pet.Pet;
import pl.witold.petcare.pet.PetAccessService;
import pl.witold.petcare.pet.PetService;
import pl.witold.petcare.user.User;
import pl.witold.petcare.vet.VetProfile;
import pl.witold.petcare.vet.VetScheduleEntry;
import pl.witold.petcare.vet.service.VetProfileService;
import pl.witold.petcare.vet.service.VetScheduleService;
import pl.witold.petcare.vet.service.VetTimeOffService;
import pl.witold.petcare.visit.commands.VisitCreateCommand;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class VisitServiceImplTest {

    @Mock private VisitRepository visitRepository;
    @Mock private PetService petService;
    @Mock private PetAccessService petAccessService;
    @Mock private VetProfileService vetProfileService;
    @Mock private VetScheduleService vetScheduleService;
    @Mock private VetTimeOffService vetTimeOffService;

    @InjectMocks private VisitServiceImpl visitService;

    @Test
    @DisplayName("Reject past visit date")
    void rejectPastDate() {
        Pet pet = mock(Pet.class);
        when(petService.getById(1L)).thenReturn(pet);
        doNothing().when(petAccessService).checkCanModify(pet);
        VetProfile vetProfile = mock(VetProfile.class);
        when(vetProfileService.getById(2L)).thenReturn(vetProfile);

        VisitCreateCommand cmd = new VisitCreateCommand(1L, 2L, LocalDate.now().minusDays(1), LocalTime.of(10,0), null, null);
        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> visitService.createVisit(cmd));
        assertTrue(ex.getMessage().toLowerCase().contains("past"));
    }

    @Test
    @DisplayName("Reject when no matching schedule entry")
    void rejectOutsideWorkingHours() {
        Pet pet = mock(Pet.class);
        when(petService.getById(1L)).thenReturn(pet);
        doNothing().when(petAccessService).checkCanModify(pet);
        VetProfile vetProfile = mock(VetProfile.class);
        when(vetProfileService.getById(2L)).thenReturn(vetProfile);
        when(vetProfile.getId()).thenReturn(2L);

        LocalDate date = LocalDate.now().plusDays(1);
        when(vetScheduleService.getScheduleForVetProfile(2L)).thenReturn(List.of());

        VisitCreateCommand cmd = new VisitCreateCommand(1L, 2L, date, LocalTime.of(10,0), null, null);
        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> visitService.createVisit(cmd));
        assertTrue(ex.getMessage().toLowerCase().contains("outside"));
    }

    @Test
    @DisplayName("Update status returns DTO")
    void updateStatusReturnsDto() {
        Visit visit = mock(Visit.class);
        Pet pet = mock(Pet.class);
        User owner = mock(User.class);
        when(owner.getId()).thenReturn(100L);
        when(owner.getFullName()).thenReturn("Owner Name");
        when(pet.getId()).thenReturn(200L);
        when(pet.getOwner()).thenReturn(owner);
        when(visit.getPet()).thenReturn(pet);
        VetProfile vetProfile = mock(VetProfile.class);
        User vetUser = mock(User.class);
        when(vetUser.getId()).thenReturn(300L);
        when(vetUser.getFullName()).thenReturn("Vet User");
        when(vetProfile.getId()).thenReturn(400L);
        when(vetProfile.getUser()).thenReturn(vetUser);
        when(visit.getVetProfile()).thenReturn(vetProfile);
        when(visit.getId()).thenReturn(55L);
        when(visit.getDate()).thenReturn(LocalDate.now().plusDays(2));
        when(visit.getStartTime()).thenReturn(LocalTime.of(9,0));
        when(visit.getEndTime()).thenReturn(LocalTime.of(9,30));
        when(visit.getStatus()).thenReturn(VisitStatus.SCHEDULED);
        when(visitRepository.findByIdWithRelations(55L)).thenReturn(Optional.of(visit));

        VisitResponseDto dto = visitService.updateVisitStatus(55L, VisitStatus.CONFIRMED);
        assertEquals(55L, dto.id());
        assertEquals(VisitStatus.SCHEDULED, dto.status());
        assertEquals(200L, dto.pet().id());
        assertEquals(400L, dto.vetProfileId());
    }

    @Test
    @DisplayName("Update status throws when visit not found")
    void updateStatusNotFound() {
        when(visitRepository.findByIdWithRelations(999L)).thenReturn(Optional.empty());
        assertThrows(ResourceNotFoundException.class, () -> visitService.updateVisitStatus(999L, VisitStatus.CANCELLED));
    }

    @Test
    @DisplayName("Reject when vet is on time off")
    void rejectTimeOff() {
        Pet pet = mock(Pet.class);
        when(petService.getById(1L)).thenReturn(pet);
        doNothing().when(petAccessService).checkCanModify(pet);
        VetProfile vetProfile = mock(VetProfile.class);
        when(vetProfileService.getById(2L)).thenReturn(vetProfile);
        when(vetProfile.getId()).thenReturn(2L);

        LocalDate date = LocalDate.now().plusDays(1);
        VetScheduleEntry entry = mock(VetScheduleEntry.class);
        when(entry.getDayOfWeek()).thenReturn(date.getDayOfWeek());
        when(entry.getStartTime()).thenReturn(java.time.LocalTime.of(9,0));
        when(entry.getEndTime()).thenReturn(java.time.LocalTime.of(12,0));
        when(entry.getSlotLengthMinutes()).thenReturn(30);
        when(vetScheduleService.getScheduleForVetProfile(2L)).thenReturn(java.util.List.of(entry));

        when(vetTimeOffService.isVetOnTimeOffOnDate(vetProfile, date)).thenReturn(true);

        VisitCreateCommand cmd = new VisitCreateCommand(1L, 2L, date, java.time.LocalTime.of(9,0), null, null);
        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> visitService.createVisit(cmd));
        assertTrue(ex.getMessage().toLowerCase().contains("time off"));
    }

    @Test
    @DisplayName("Reject when slot is already taken")
    void rejectConflict() {
        Pet pet = mock(Pet.class);
        when(petService.getById(1L)).thenReturn(pet);
        doNothing().when(petAccessService).checkCanModify(pet);
        VetProfile vetProfile = mock(VetProfile.class);
        when(vetProfileService.getById(2L)).thenReturn(vetProfile);
        when(vetProfile.getId()).thenReturn(2L);

        LocalDate date = LocalDate.now().plusDays(1);
        VetScheduleEntry entry = mock(VetScheduleEntry.class);
        when(entry.getDayOfWeek()).thenReturn(date.getDayOfWeek());
        when(entry.getStartTime()).thenReturn(java.time.LocalTime.of(9,0));
        when(entry.getEndTime()).thenReturn(java.time.LocalTime.of(12,0));
        when(entry.getSlotLengthMinutes()).thenReturn(30);
        when(vetScheduleService.getScheduleForVetProfile(2L)).thenReturn(java.util.List.of(entry));

        when(vetTimeOffService.isVetOnTimeOffOnDate(vetProfile, date)).thenReturn(false);
        when(visitRepository.existsByVetProfileAndDateAndStatusInAndStartTimeLessThanAndEndTimeGreaterThan(
                eq(vetProfile), eq(date), anySet(), any(), any()
        )).thenReturn(true);

        VisitCreateCommand cmd = new VisitCreateCommand(1L, 2L, date, java.time.LocalTime.of(9,0), null, null);
        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> visitService.createVisit(cmd));
        assertTrue(ex.getMessage().toLowerCase().contains("taken"));
    }

    @Test
    @DisplayName("Reject same-day past start time")
    void rejectPastStartTimeToday() {
        Pet pet = mock(Pet.class);
        when(petService.getById(1L)).thenReturn(pet);
        doNothing().when(petAccessService).checkCanModify(pet);
        VetProfile vetProfile = mock(VetProfile.class);
        when(vetProfileService.getById(2L)).thenReturn(vetProfile);

        LocalDate today = LocalDate.now();
        LocalTime pastStart = LocalTime.MIN; // 00:00 always before current time

        VisitCreateCommand cmd = new VisitCreateCommand(1L, 2L, today, pastStart, "Reason", null);
        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> visitService.createVisit(cmd));
        assertEquals("Visit start time cannot be in the past", ex.getMessage());
    }
}
