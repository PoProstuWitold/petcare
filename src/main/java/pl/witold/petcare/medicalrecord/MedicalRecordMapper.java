package pl.witold.petcare.medicalrecord;

import pl.witold.petcare.dto.PetResponseDto;
import pl.witold.petcare.dto.VetProfileResponseDto;
import pl.witold.petcare.dto.VisitResponseDto;
import pl.witold.petcare.pet.Pet;
import pl.witold.petcare.user.User;
import pl.witold.petcare.vet.VetProfile;
import pl.witold.petcare.vet.mapper.VetProfileMapper;
import pl.witold.petcare.visit.Visit;
import pl.witold.petcare.visit.VisitMapper;

public final class MedicalRecordMapper {

    private MedicalRecordMapper() {
    }

    public static pl.witold.petcare.dto.MedicalRecordResponseDto toDto(MedicalRecord record) {
        Pet pet = record.getPet();
        VetProfile vetProfile = record.getVetProfile();
        User owner = pet.getOwner();
        Visit visit = record.getVisit();

        PetResponseDto petDto = new PetResponseDto(
                pet.getId(),
                owner.getId(),
                owner.getFullName(),
                pet.getName(),
                pet.getSpecies(),
                pet.getSex(),
                pet.getBreed(),
                pet.getBirthDate(),
                pet.getBirthYear(),
                pet.getWeight(),
                pet.getNotes()
        );

        VetProfileResponseDto vetDto = VetProfileMapper.toDto(vetProfile);
        VisitResponseDto visitDto = VisitMapper.toDto(visit);

        return new pl.witold.petcare.dto.MedicalRecordResponseDto(
                record.getId(),
                petDto,
                vetDto,
                visitDto,
                record.getTitle(),
                record.getDiagnosis(),
                record.getTreatment(),
                record.getPrescriptions(),
                record.getNotes(),
                record.getCreatedAt()
        );
    }
}
