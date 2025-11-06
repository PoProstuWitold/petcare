package pl.witold.petcare.vet.service;

import pl.witold.petcare.vet.VetScheduleEntry;
import pl.witold.petcare.vet.commands.VetScheduleEntryCommand;

import java.util.List;

/**
 * Service for managing vet schedules.
 */
public interface VetScheduleService {

    /**
     * Returns schedule entries for the current vet.
     */
    List<VetScheduleEntry> getScheduleForCurrentVet();

    /**
     * Replaces the schedule for the current vet with the provided entries.
     */
    List<VetScheduleEntry> updateScheduleForCurrentVet(List<VetScheduleEntryCommand> commands);

    /**
     * Returns schedule entries for a vet identified by vet profile id.
     */
    List<VetScheduleEntry> getScheduleForVetProfile(Long vetProfileId);
}
