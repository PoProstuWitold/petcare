package pl.witold.petcare.visit;

import org.springframework.data.jpa.repository.JpaRepository;
import pl.witold.petcare.pet.Pet;
import pl.witold.petcare.vet.VetProfile;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Collection;
import java.util.List;

/**
 * Repository for Visit entity.
 */
public interface VisitRepository extends JpaRepository<Visit, Long> {

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
}
