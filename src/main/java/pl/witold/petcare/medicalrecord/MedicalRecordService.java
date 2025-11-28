package pl.witold.petcare.medicalrecord;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import pl.witold.petcare.dto.MedicalRecordResponseDto;
import pl.witold.petcare.medicalrecord.commands.MedicalRecordCreateCommand;

import java.util.List;
import java.util.Optional;

public interface MedicalRecordService {

    MedicalRecordResponseDto create(MedicalRecordCreateCommand command);

    List<MedicalRecordResponseDto> getForPet(Long petId);

    Page<MedicalRecordResponseDto> getForPet(Long petId, Pageable pageable);

    List<MedicalRecordResponseDto> getForCurrentVet();

    Page<MedicalRecordResponseDto> getForCurrentVet(Pageable pageable);

    Optional<MedicalRecordResponseDto> getByVisitId(Long visitId);

    MedicalRecordResponseDto update(Long id, pl.witold.petcare.medicalrecord.commands.MedicalRecordUpdateCommand command);

    void delete(Long id);

    List<MedicalRecordResponseDto> getAll();

    Page<MedicalRecordResponseDto> getAll(Pageable pageable);
}
