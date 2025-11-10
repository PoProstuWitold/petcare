package pl.witold.petcare.visit;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pl.witold.petcare.dto.VisitResponseDto;
import pl.witold.petcare.exceptions.ResourceNotFoundException;
import pl.witold.petcare.pet.Pet;
import pl.witold.petcare.pet.PetAccessService;
import pl.witold.petcare.pet.PetService;
import pl.witold.petcare.vet.VetProfile;
import pl.witold.petcare.vet.VetScheduleEntry;
import pl.witold.petcare.vet.service.VetProfileService;
import pl.witold.petcare.vet.service.VetScheduleService;
import pl.witold.petcare.vet.service.VetTimeOffService;
import pl.witold.petcare.visit.commands.VisitCreateCommand;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.EnumSet;
import java.util.List;
import java.util.Set;

/**
 * Default implementation of VisitService containing business rules for booking visits.
 */
@Service
@RequiredArgsConstructor
@Transactional
public class VisitServiceImpl implements VisitService {

    private static final Set<VisitStatus> BLOCKING_STATUSES = EnumSet.of(
            VisitStatus.SCHEDULED,
            VisitStatus.CONFIRMED
    );

    private final VisitRepository visitRepository;
    private final PetService petService;
    private final PetAccessService petAccessService;
    private final VetProfileService vetProfileService;
    private final VetScheduleService vetScheduleService;
    private final VetTimeOffService vetTimeOffService;

    @Override
    public Visit createVisit(VisitCreateCommand command) {
        Pet pet = petService.getById(command.petId());
        petAccessService.checkCanModify(pet);

        VetProfile vetProfile = vetProfileService.getById(command.vetProfileId());

        LocalDate date = command.date();
        LocalTime requestedStart = command.startTime();

        validateRequired(date, requestedStart);
        validateNotPast(date);

        VetScheduleEntry scheduleEntry = findMatchingScheduleEntry(vetProfile, date, requestedStart);
        LocalTime endTime = requestedStart.plusMinutes(scheduleEntry.getSlotLengthMinutes());

        validateNotOnTimeOff(vetProfile, date);
        validateNoConflict(vetProfile, date, requestedStart, endTime);

        Visit visit = new Visit(
                pet,
                vetProfile,
                date,
                requestedStart,
                endTime,
                command.reason(),
                command.notes()
        );

        return visitRepository.save(visit);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Visit> getVisitsForPet(Long petId) {
        Pet pet = petService.getById(petId);
        petAccessService.checkCanView(pet);
        return visitRepository.findByPetOrderByDateAscStartTimeAsc(pet);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Visit> getVisitsForVetAndDate(Long vetProfileId, LocalDate date) {
        VetProfile profile = vetProfileService.getById(vetProfileId);
        return visitRepository.findByVetProfileAndDateOrderByStartTimeAsc(profile, date);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Visit> getVisitsForCurrentVet() {
        VetProfile profile = vetProfileService.getOrCreateCurrentVetProfile();
        return visitRepository.findByVetProfileOrderByDateAscStartTimeAsc(profile);
    }

    @Override
    public VisitResponseDto updateVisitStatus(Long visitId, VisitStatus status) {
        Visit visit = visitRepository
                .findByIdWithRelations(visitId)
                .orElseThrow(() -> new ResourceNotFoundException("Visit not found"));

        visit.setStatus(status);

        return VisitMapper.toDto(visit);
    }

    private VetScheduleEntry findMatchingScheduleEntry(
            VetProfile vetProfile,
            LocalDate date,
            LocalTime requestedStart
    ) {
        List<VetScheduleEntry> weeklySchedule = vetScheduleService.getScheduleForVetProfile(vetProfile.getId());

        return weeklySchedule.stream()
                .filter(entry -> entry.getDayOfWeek().equals(date.getDayOfWeek()))
                .filter(entry -> isWithinEntry(requestedStart, entry))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Requested time is outside vet working hours"));
    }

    private boolean isWithinEntry(LocalTime requestedStart, VetScheduleEntry entry) {
        LocalTime blockStart = entry.getStartTime();
        LocalTime blockEnd = entry.getEndTime();
        int slotLengthMinutes = entry.getSlotLengthMinutes();

        if (!requestedStart.isBefore(blockEnd) || requestedStart.isBefore(blockStart)) {
            return false;
        }

        long minutesFromBlockStart =
                java.time.Duration.between(blockStart, requestedStart).toMinutes();
        return minutesFromBlockStart % slotLengthMinutes == 0;
    }

    private void validateRequired(LocalDate date, LocalTime start) {
        if (date == null || start == null) {
            throw new IllegalArgumentException("Visit date and start time must be provided");
        }
    }

    private void validateNotPast(LocalDate date) {
        if (date.isBefore(LocalDate.now())) {
            throw new IllegalArgumentException("Visit date cannot be in the past");
        }
    }

    private void validateNotOnTimeOff(VetProfile vetProfile, LocalDate date) {
        if (vetTimeOffService.isVetOnTimeOffOnDate(vetProfile, date)) {
            throw new IllegalArgumentException("Vet is on time off on the selected date");
        }
    }

    private void validateNoConflict(
            VetProfile vetProfile,
            LocalDate date,
            LocalTime start,
            LocalTime end
    ) {
        boolean hasConflict = visitRepository
                .existsByVetProfileAndDateAndStatusInAndStartTimeLessThanAndEndTimeGreaterThan(
                        vetProfile,
                        date,
                        BLOCKING_STATUSES,
                        end,
                        start
                );
        if (hasConflict) {
            throw new IllegalArgumentException("Selected time slot is already taken");
        }
    }
}
