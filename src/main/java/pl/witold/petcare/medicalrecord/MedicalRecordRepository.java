package pl.witold.petcare.medicalrecord;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface MedicalRecordRepository extends JpaRepository<MedicalRecord, Long> {

    @EntityGraph(attributePaths = {"pet", "pet.owner", "vetProfile", "vetProfile.user", "vetProfile.specializations", "visit"})
    List<MedicalRecord> findByPetIdOrderByCreatedAtDesc(Long petId);

    @EntityGraph(attributePaths = {"pet", "pet.owner", "vetProfile", "vetProfile.user", "vetProfile.specializations", "visit"})
    Optional<MedicalRecord> findByVisitId(Long visitId);

    @EntityGraph(attributePaths = {"pet", "pet.owner", "vetProfile", "vetProfile.user", "vetProfile.specializations", "visit"})
    List<MedicalRecord> findByVetProfileIdOrderByCreatedAtDesc(Long vetProfileId);
}
