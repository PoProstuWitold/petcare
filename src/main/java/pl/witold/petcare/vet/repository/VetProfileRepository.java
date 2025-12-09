package pl.witold.petcare.vet.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pl.witold.petcare.vet.VetProfile;

import java.util.Optional;

/**
 * c
 * Repository for accessing VetProfile entities.
 */
public interface VetProfileRepository extends JpaRepository<VetProfile, Long> {

    Optional<VetProfile> findByUserId(Long userId);

    boolean existsByUserId(Long userId);
}
