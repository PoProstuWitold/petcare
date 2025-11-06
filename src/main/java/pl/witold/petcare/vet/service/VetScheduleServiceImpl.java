package pl.witold.petcare.vet.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pl.witold.petcare.vet.VetProfile;
import pl.witold.petcare.vet.VetScheduleEntry;
import pl.witold.petcare.vet.commands.VetScheduleEntryCommand;
import pl.witold.petcare.vet.repository.VetScheduleEntryRepository;

import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Implementation of VetScheduleService containing business logic for schedules.
 */
@Service
@RequiredArgsConstructor
@Transactional
public class VetScheduleServiceImpl implements VetScheduleService {

    private final VetScheduleEntryRepository vetScheduleEntryRepository;
    private final VetProfileService vetProfileService;

    @Override
    @Transactional(readOnly = true)
    public List<VetScheduleEntry> getScheduleForCurrentVet() {
        VetProfile profile = vetProfileService.getOrCreateCurrentVetProfile();
        return vetScheduleEntryRepository.findByVetProfileOrderByDayOfWeekAscStartTimeAsc(profile);
    }

    @Override
    public List<VetScheduleEntry> updateScheduleForCurrentVet(List<VetScheduleEntryCommand> commands) {
        VetProfile profile = vetProfileService.getOrCreateCurrentVetProfile();

        vetScheduleEntryRepository.deleteByVetProfile(profile);

        List<VetScheduleEntry> entries = new ArrayList<>();

        for (VetScheduleEntryCommand command : commands) {
            validateCommand(command);

            VetScheduleEntry entry = new VetScheduleEntry();
            entry.setVetProfile(profile);
            entry.setDayOfWeek(command.dayOfWeek());
            entry.setStartTime(command.startTime());
            entry.setEndTime(command.endTime());
            entry.setSlotLengthMinutes(command.slotLengthMinutes());

            entries.add(entry);
        }

        return vetScheduleEntryRepository.saveAll(entries);
    }

    @Override
    @Transactional(readOnly = true)
    public List<VetScheduleEntry> getScheduleForVetProfile(Long vetProfileId) {
        VetProfile profile = vetProfileService.getById(vetProfileId);
        return vetScheduleEntryRepository.findByVetProfileOrderByDayOfWeekAscStartTimeAsc(profile);
    }

    private void validateCommand(VetScheduleEntryCommand command) {
        LocalTime start = command.startTime();
        LocalTime end = command.endTime();

        if (!start.isBefore(end)) {
            throw new IllegalArgumentException("Start time must be before end time");
        }
    }
}
