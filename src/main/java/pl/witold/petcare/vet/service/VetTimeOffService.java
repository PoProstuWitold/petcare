package pl.witold.petcare.vet.service;

import pl.witold.petcare.vet.VetProfile;
import pl.witold.petcare.vet.VetTimeOff;
import pl.witold.petcare.vet.commands.VetTimeOffCreateCommand;

import java.time.LocalDate;
import java.util.List;

/**
 * Service for managing vet time-off periods.
 */
public interface VetTimeOffService {

    /**
     * Returns all time-off periods for the currently authenticated vet.
     */
    List<VetTimeOff> getTimeOffForCurrentVet();

    /**
     * Creates a new time-off period for the currently authenticated vet.
     */
    VetTimeOff createTimeOffForCurrentVet(VetTimeOffCreateCommand command);

    /**
     * Deletes a time-off entry for the currently authenticated vet by id.
     */
    void deleteTimeOffForCurrentVet(Long id);

    /**
     * Returns time-off periods for a vet identified by vet profile id.
     * Useful when clients want to see when the vet is not available.
     */
    List<VetTimeOff> getTimeOffForVetProfile(Long vetProfileId);

    /**
     * Checks if the vet is on time-off for the given date.
     * This will be useful later in AppointmentService.
     */
    boolean isVetOnTimeOffOnDate(VetProfile vetProfile, LocalDate date);
}
