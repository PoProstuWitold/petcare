package pl.witold.petcare.vet.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import pl.witold.petcare.vet.VetProfile;
import pl.witold.petcare.vet.commands.VetProfileUpdateCommand;

import java.util.List;

/**
 * Service for managing vet profiles.
 */
public interface VetProfileService {

    /**
     * Returns an existing vet profile for the current vet or creates a new one with default values.
     */
    VetProfile getOrCreateCurrentVetProfile();

    /**
     * Updates vet profile for the current vet using the given command.
     */
    VetProfile updateCurrentVetProfile(VetProfileUpdateCommand command);

    /**
     * Returns a vet profile by its id.
     */
    VetProfile getById(Long id);

    /**
     * Returns all vet profiles.
     */
    List<VetProfile> getAllProfiles();

    /**
     * Returns a paginated list of all vet profiles.
     */
    Page<VetProfile> getAllProfiles(Pageable pageable);
}
