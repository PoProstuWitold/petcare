package pl.witold.petcare.medicalrecord;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface MedicalRecordRepository extends JpaRepository<MedicalRecord, Long> {

    @EntityGraph(attributePaths = {"pet", "pet.owner", "vetProfile", "vetProfile.user", "vetProfile.specializations", "visit"})
    List<MedicalRecord> findByPetIdOrderByCreatedAtDesc(Long petId);

    @Query(value = """
        select distinct m from MedicalRecord m
        left join fetch m.pet p
        left join fetch p.owner
        left join fetch m.vetProfile vp
        left join fetch vp.user
        left join fetch vp.specializations
        left join fetch m.visit
        where m.pet.id = :petId
        order by m.createdAt desc
        """, countQuery = "select count(distinct m) from MedicalRecord m where m.pet.id = :petId")
    Page<MedicalRecord> findByPetIdOrderByCreatedAtDesc(@Param("petId") Long petId, Pageable pageable);

    @EntityGraph(attributePaths = {"pet", "pet.owner", "vetProfile", "vetProfile.user", "vetProfile.specializations", "visit"})
    Optional<MedicalRecord> findByVisitId(Long visitId);

    @EntityGraph(attributePaths = {"pet", "pet.owner", "vetProfile", "vetProfile.user", "vetProfile.specializations", "visit"})
    List<MedicalRecord> findByVetProfileIdOrderByCreatedAtDesc(Long vetProfileId);

    @Query(value = """
        select distinct m from MedicalRecord m
        left join fetch m.pet p
        left join fetch p.owner
        left join fetch m.vetProfile vp
        left join fetch vp.user
        left join fetch vp.specializations
        left join fetch m.visit
        where m.vetProfile.id = :vetProfileId
        order by m.createdAt desc
        """, countQuery = "select count(distinct m) from MedicalRecord m where m.vetProfile.id = :vetProfileId")
    Page<MedicalRecord> findByVetProfileIdOrderByCreatedAtDesc(@Param("vetProfileId") Long vetProfileId, Pageable pageable);

    @EntityGraph(attributePaths = {"pet", "pet.owner", "vetProfile", "vetProfile.user", "vetProfile.specializations", "visit"})
    List<MedicalRecord> findAllByOrderByCreatedAtDesc();

    @Query(value = """
        select distinct m from MedicalRecord m
        left join fetch m.pet p
        left join fetch p.owner
        left join fetch m.vetProfile vp
        left join fetch vp.user
        left join fetch vp.specializations
        left join fetch m.visit
        order by m.createdAt desc
        """, countQuery = "select count(distinct m) from MedicalRecord m")
    Page<MedicalRecord> findAllByOrderByCreatedAtDesc(Pageable pageable);
}
