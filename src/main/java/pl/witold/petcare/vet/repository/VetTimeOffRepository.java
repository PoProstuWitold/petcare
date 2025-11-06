package pl.witold.petcare.vet.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pl.witold.petcare.vet.VetProfile;
import pl.witold.petcare.vet.VetTimeOff;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

/**
 * Repository for accessing VetTimeOff entities.
 */
public interface VetTimeOffRepository extends JpaRepository<VetTimeOff, Long> {

    List<VetTimeOff> findByVetProfileOrderByStartDateAsc(VetProfile vetProfile);

    List<VetTimeOff> findByVetProfileAndEndDateGreaterThanEqualAndStartDateLessThanEqual(
            VetProfile vetProfile,
            LocalDate fromDate,
            LocalDate toDate
    );

    Optional<VetTimeOff> findByIdAndVetProfile(Long id, VetProfile vetProfile);
}
