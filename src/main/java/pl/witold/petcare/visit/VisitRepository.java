package pl.witold.petcare.visit;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import pl.witold.petcare.pet.Pet;
import pl.witold.petcare.vet.VetProfile;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

/**
 * Repository for Visit entity.
 */
public interface VisitRepository extends JpaRepository<Visit, Long> {

    @Query("""
        select v
        from Visit v
        left join fetch v.vetProfile
        left join fetch v.pet p
        left join fetch p.owner
        where v.id = :id
    """)
    Optional<Visit> findByIdWithRelations(@Param("id") Long id);

    List<Visit> findByPetOrderByDateAscStartTimeAsc(Pet pet);

    List<Visit> findByVetProfileAndDateOrderByStartTimeAsc(VetProfile vetProfile, LocalDate date);

    /**
     * Checks if there is any visit for given vet/date that overlaps given time range.
     * Used to block already taken slots.
     */
    boolean existsByVetProfileAndDateAndStatusInAndStartTimeLessThanAndEndTimeGreaterThan(
            VetProfile vetProfile,
            LocalDate date,
            Collection<VisitStatus> statuses,
            LocalTime endTime,
            LocalTime startTime
    );

    @EntityGraph(attributePaths = {"pet", "pet.owner", "vetProfile", "vetProfile.user"})
    List<Visit> findByVetProfileOrderByDateAscStartTimeAsc(VetProfile vetProfile);
}
