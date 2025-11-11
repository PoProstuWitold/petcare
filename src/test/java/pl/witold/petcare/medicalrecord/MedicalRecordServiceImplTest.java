package pl.witold.petcare.medicalrecord;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import pl.witold.petcare.exceptions.DuplicateMedicalRecordException;
import pl.witold.petcare.exceptions.ResourceNotFoundException;
import pl.witold.petcare.medicalrecord.commands.MedicalRecordCreateCommand;
import pl.witold.petcare.security.CurrentUserService;
import pl.witold.petcare.user.Role;
import pl.witold.petcare.vet.VetProfile;
import pl.witold.petcare.vet.service.VetProfileService;
import pl.witold.petcare.visit.Visit;
import pl.witold.petcare.visit.VisitRepository;
import pl.witold.petcare.visit.VisitStatus;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class MedicalRecordServiceImplTest {

    @Mock private MedicalRecordRepository medicalRecordRepository;
    @Mock private VetProfileService vetProfileService;
    @Mock private VisitRepository visitRepository;
    @Mock private CurrentUserService currentUserService;

    @InjectMocks private MedicalRecordServiceImpl medicalRecordService;

    @Test
    @DisplayName("Reject creation when visit not found")
    void rejectWhenVisitNotFound() {
        when(visitRepository.findByIdWithRelations(5L)).thenReturn(Optional.empty());
        MedicalRecordCreateCommand cmd = new MedicalRecordCreateCommand(5L, null, null, null, null, null);
        assertThrows(ResourceNotFoundException.class, () -> medicalRecordService.create(cmd));
    }

    @Test
    @DisplayName("Reject creation when visit status not allowed")
    void rejectWhenStatusNotAllowed() {
        Visit visit = mock(Visit.class);
        VetProfile profile = mock(VetProfile.class);
        when(visitRepository.findByIdWithRelations(10L)).thenReturn(Optional.of(visit));
        when(visit.getVetProfile()).thenReturn(profile);
        when(vetProfileService.getOrCreateCurrentVetProfile()).thenReturn(profile);
        when(currentUserService.hasAnyRole(Role.ADMIN)).thenReturn(false); // simulate non-admin vet
        when(profile.getId()).thenReturn(22L);
        when(visit.getStatus()).thenReturn(VisitStatus.SCHEDULED); // not allowed
        MedicalRecordCreateCommand cmd = new MedicalRecordCreateCommand(10L, null, null, null, null, null);
        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> medicalRecordService.create(cmd));
        assertTrue(ex.getMessage().toLowerCase().contains("confirmed") || ex.getMessage().toLowerCase().contains("completed"));
    }

    @Test
    @DisplayName("Reject creation when record already exists")
    void rejectDuplicateRecord() {
        Visit visit = mock(Visit.class);
        VetProfile profile = mock(VetProfile.class);
        when(visitRepository.findByIdWithRelations(15L)).thenReturn(Optional.of(visit));
        when(visit.getVetProfile()).thenReturn(profile);
        when(vetProfileService.getOrCreateCurrentVetProfile()).thenReturn(profile);
        when(currentUserService.hasAnyRole(Role.ADMIN)).thenReturn(false); // vet branch
        when(profile.getId()).thenReturn(30L);
        when(visit.getStatus()).thenReturn(VisitStatus.CONFIRMED); // allowed
        when(visit.getId()).thenReturn(15L);
        when(medicalRecordRepository.findByVisitId(any())).thenReturn(Optional.of(mock(MedicalRecord.class)));

        MedicalRecordCreateCommand cmd = new MedicalRecordCreateCommand(15L, null, null, null, null, null);
        assertThrows(DuplicateMedicalRecordException.class, () -> medicalRecordService.create(cmd));
    }
}
