package pl.witold.petcare.medicalrecord;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pl.witold.petcare.dto.MedicalRecordResponseDto;
import pl.witold.petcare.exceptions.DuplicateMedicalRecordException;
import pl.witold.petcare.exceptions.MedicalRecordStatusNotAllowedException;
import pl.witold.petcare.exceptions.ResourceNotFoundException;
import pl.witold.petcare.medicalrecord.commands.MedicalRecordCreateCommand;
import pl.witold.petcare.medicalrecord.commands.MedicalRecordUpdateCommand;
import pl.witold.petcare.pet.Pet;
import pl.witold.petcare.pet.PetAccessService;
import pl.witold.petcare.pet.PetService;
import pl.witold.petcare.vet.VetProfile;
import pl.witold.petcare.vet.service.VetProfileService;
import pl.witold.petcare.visit.Visit;
import pl.witold.petcare.visit.VisitRepository;
import pl.witold.petcare.visit.VisitStatus;
import pl.witold.petcare.security.CurrentUserService;
import pl.witold.petcare.user.Role;

import java.util.EnumSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;

@Service
@RequiredArgsConstructor
@Transactional
public class MedicalRecordServiceImpl implements MedicalRecordService {

    private static final Set<VisitStatus> ALLOWED_STATUSES_FOR_RECORD = EnumSet.of(
            VisitStatus.COMPLETED,
            VisitStatus.CONFIRMED
    );

    private final MedicalRecordRepository medicalRecordRepository;
    private final PetService petService;
    private final PetAccessService petAccessService;
    private final VetProfileService vetProfileService;
    private final VisitRepository visitRepository;
    private final CurrentUserService currentUserService;

    @Override
    public MedicalRecordResponseDto create(MedicalRecordCreateCommand command) {
        Visit visit = visitRepository.findByIdWithRelations(command.visitId())
                .orElseThrow(() -> new ResourceNotFoundException("Visit not found"));

        VetProfile vetProfile = visit.getVetProfile();
        assertCanModifyForVet(vetProfile, "create records for your own visits");
        assertVisitStatusAllowsRecord(visit);
        assertNoDuplicateRecord(visit.getId());

        Pet pet = visit.getPet();
        MedicalRecord record = new MedicalRecord(
                pet,
                vetProfile,
                visit,
                command.title(),
                command.diagnosis(),
                command.treatment(),
                command.prescriptions(),
                command.notes()
        );
        MedicalRecord saved = medicalRecordRepository.save(record);
        return MedicalRecordMapper.toDto(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<MedicalRecordResponseDto> getForPet(Long petId) {
        Pet pet = petService.getById(petId);
        petAccessService.checkCanView(pet);
        return medicalRecordRepository.findByPetIdOrderByCreatedAtDesc(pet.getId())
                .stream()
                .map(MedicalRecordMapper::toDto)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public Page<MedicalRecordResponseDto> getForPet(Long petId, Pageable pageable) {
        Pet pet = petService.getById(petId);
        petAccessService.checkCanView(pet);
        // Remove sorting from Pageable since it's already in the query
        Pageable unsortedPageable = PageRequest.of(pageable.getPageNumber(), pageable.getPageSize());
        return medicalRecordRepository.findByPetIdOrderByCreatedAtDesc(pet.getId(), unsortedPageable)
                .map(MedicalRecordMapper::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public List<MedicalRecordResponseDto> getForCurrentVet() {
        VetProfile profile = vetProfileService.getOrCreateCurrentVetProfile();
        return medicalRecordRepository.findByVetProfileIdOrderByCreatedAtDesc(profile.getId())
                .stream()
                .map(MedicalRecordMapper::toDto)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public Page<MedicalRecordResponseDto> getForCurrentVet(Pageable pageable) {
        VetProfile profile = vetProfileService.getOrCreateCurrentVetProfile();
        // Remove sorting from Pageable since it's already in the query
        Pageable unsortedPageable = PageRequest.of(pageable.getPageNumber(), pageable.getPageSize());
        return medicalRecordRepository.findByVetProfileIdOrderByCreatedAtDesc(profile.getId(), unsortedPageable)
                .map(MedicalRecordMapper::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<MedicalRecordResponseDto> getByVisitId(Long visitId) {
        return medicalRecordRepository.findByVisitId(visitId).map(MedicalRecordMapper::toDto);
    }

    @Override
    public MedicalRecordResponseDto update(Long id, MedicalRecordUpdateCommand command) {
        MedicalRecord record = medicalRecordRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Medical record not found"));
        assertCanModifyForVet(record.getVetProfile(), "update records you created");

        if (command.title() != null) record.setTitle(command.title());
        if (command.diagnosis() != null) record.setDiagnosis(command.diagnosis());
        if (command.treatment() != null) record.setTreatment(command.treatment());
        if (command.prescriptions() != null) record.setPrescriptions(command.prescriptions());
        if (command.notes() != null) record.setNotes(command.notes());
        return MedicalRecordMapper.toDto(record);
    }

    @Override
    public void delete(Long id) {
        MedicalRecord record = medicalRecordRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Medical record not found"));
        assertCanModifyForVet(record.getVetProfile(), "delete records you created");
        medicalRecordRepository.delete(record);
    }

    @Override
    public List<MedicalRecordResponseDto> getAll() {
        return medicalRecordRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(MedicalRecordMapper::toDto)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public Page<MedicalRecordResponseDto> getAll(Pageable pageable) {
        // Remove sorting from Pageable since it's already in the query
        Pageable unsortedPageable = PageRequest.of(pageable.getPageNumber(), pageable.getPageSize());
        return medicalRecordRepository.findAllByOrderByCreatedAtDesc(unsortedPageable)
                .map(MedicalRecordMapper::toDto);
    }

    // --- Private helpers ---
    private void assertCanModifyForVet(VetProfile targetProfile, String actionPhrase) {
        boolean isAdmin = currentUserService.hasAnyRole(Role.ADMIN);
        if (isAdmin) return;
        VetProfile currentVetProfile = vetProfileService.getOrCreateCurrentVetProfile();
        if (currentVetProfile == null || !targetProfile.getId().equals(currentVetProfile.getId())) {
            throw new AccessDeniedException("You can only " + actionPhrase);
        }
    }

    private void assertVisitStatusAllowsRecord(Visit visit) {
        if (!ALLOWED_STATUSES_FOR_RECORD.contains(visit.getStatus())) {
            throw new MedicalRecordStatusNotAllowedException("Medical record can be created only for confirmed or completed visits");
        }
    }

    private void assertNoDuplicateRecord(Long visitId) {
        medicalRecordRepository.findByVisitId(visitId).ifPresent(r -> {
            throw new DuplicateMedicalRecordException("Medical record already exists for this visit");
        });
    }
}
