package pl.witold.petcare.medicalrecord;

import pl.witold.petcare.dto.MedicalRecordResponseDto;
import pl.witold.petcare.medicalrecord.commands.MedicalRecordCreateCommand;

import java.util.List;
import java.util.Optional;

public interface MedicalRecordService {

    MedicalRecordResponseDto create(MedicalRecordCreateCommand command);

    List<MedicalRecordResponseDto> getForPet(Long petId);

    List<MedicalRecordResponseDto> getForCurrentVet();

    Optional<MedicalRecordResponseDto> getByVisitId(Long visitId);
}
