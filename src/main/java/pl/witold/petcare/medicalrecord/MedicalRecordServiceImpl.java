package pl.witold.petcare.medicalrecord;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pl.witold.petcare.dto.MedicalRecordResponseDto;
import pl.witold.petcare.exceptions.DuplicateMedicalRecordException;
import pl.witold.petcare.exceptions.ResourceNotFoundException;
import pl.witold.petcare.medicalrecord.commands.MedicalRecordCreateCommand;
import pl.witold.petcare.pet.Pet;
import pl.witold.petcare.pet.PetAccessService;
import pl.witold.petcare.pet.PetService;
import pl.witold.petcare.vet.VetProfile;
import pl.witold.petcare.vet.service.VetProfileService;
import pl.witold.petcare.visit.Visit;
import pl.witold.petcare.visit.VisitRepository;
import pl.witold.petcare.visit.VisitStatus;

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

    @Override
    public MedicalRecordResponseDto create(MedicalRecordCreateCommand command) {
        Visit visit = visitRepository.findByIdWithRelations(command.visitId())
                .orElseThrow(() -> new ResourceNotFoundException("Visit not found"));

        // Ensure only vet owning visit can create record and visit is COMPLETED or CONFIRMED
        VetProfile vetProfile = visit.getVetProfile();
        VetProfile currentVetProfile = vetProfileService.getOrCreateCurrentVetProfile();
        if (!vetProfile.getId().equals(currentVetProfile.getId())) {
            throw new IllegalArgumentException("You can only create records for your own visits");
        }

        if (!ALLOWED_STATUSES_FOR_RECORD.contains(visit.getStatus())) {
            throw new IllegalArgumentException("Medical record can be created only for confirmed or completed visits");
        }

        medicalRecordRepository.findByVisitId(visit.getId()).ifPresent(r -> {
            throw new DuplicateMedicalRecordException("Medical record already exists for this visit");
        });

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
    public List<MedicalRecordResponseDto> getForCurrentVet() {
        VetProfile profile = vetProfileService.getOrCreateCurrentVetProfile();
        return medicalRecordRepository.findByVetProfileIdOrderByCreatedAtDesc(profile.getId())
                .stream()
                .map(MedicalRecordMapper::toDto)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<MedicalRecordResponseDto> getByVisitId(Long visitId) {
        return medicalRecordRepository.findByVisitId(visitId).map(MedicalRecordMapper::toDto);
    }
}
