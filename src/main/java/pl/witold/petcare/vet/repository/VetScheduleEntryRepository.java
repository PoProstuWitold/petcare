package pl.witold.petcare.vet.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pl.witold.petcare.vet.VetProfile;
import pl.witold.petcare.vet.VetScheduleEntry;

import java.util.List;

/**
 * Repository for accessing VetScheduleEntry entities.
 */
public interface VetScheduleEntryRepository extends JpaRepository<VetScheduleEntry, Long> {

    List<VetScheduleEntry> findByVetProfileOrderByDayOfWeekAscStartTimeAsc(VetProfile vetProfile);

    void deleteByVetProfile(VetProfile vetProfile);
}
