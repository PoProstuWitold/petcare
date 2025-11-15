package pl.witold.petcare.visit;

import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pl.witold.petcare.dto.VisitResponseDto;
import pl.witold.petcare.exceptions.ResourceNotFoundException;
import pl.witold.petcare.pet.Pet;
import pl.witold.petcare.pet.PetAccessService;
import pl.witold.petcare.pet.PetService;
import pl.witold.petcare.security.CurrentUserService;
import pl.witold.petcare.user.Role;
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
 * Visit service with local validation helpers (SRP kept minimal:
 * persistence + orchestration + concise validation).
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
    private final CurrentUserService currentUserService;

    @Override
    public Visit createVisit(VisitCreateCommand command) {
        Pet pet = petService.getById(command.petId());
        petAccessService.checkCanModify(pet);
        VetProfile vetProfile = vetProfileService.getById(command.vetProfileId());

        LocalDate date = command.date();
        LocalTime start = command.startTime();

        validateRequired(date, start);
        validateTemporal(date, start);
        VetScheduleEntry scheduleEntry = findScheduleEntry(vetProfile, date, start);
        LocalTime end = start.plusMinutes(scheduleEntry.getSlotLengthMinutes());
        validateNotOnTimeOff(vetProfile, date);
        validateNoConflict(vetProfile, date, start, end);

        Visit visit = new Visit(
                pet,
                vetProfile,
                date,
                start,
                end,
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
        Visit visit = visitRepository.findByIdWithRelations(visitId)
                .orElseThrow(() -> new ResourceNotFoundException("Visit not found"));
        visit.setStatus(status);
        return VisitMapper.toDto(visit);
    }

    @Override
    @Transactional(readOnly = true)
    public Visit getById(Long visitId) {
        Visit visit = visitRepository.findByIdWithRelations(visitId)
                .orElseThrow(() -> new ResourceNotFoundException("Visit not found"));
        if (canView(visit)) {
            return visit;
        }
        throw new AccessDeniedException("You are not allowed to view this visit");
    }

    @Override
    public void deleteById(Long visitId) {
        Visit visit = visitRepository.findByIdWithRelations(visitId)
                .orElseThrow(() -> new ResourceNotFoundException("Visit not found"));
        visitRepository.delete(visit);
    }

    @Override
    public VisitResponseDto updateVisitFields(Long visitId, String reason, String notes) {
        Visit visit = visitRepository.findByIdWithRelations(visitId)
                .orElseThrow(() -> new ResourceNotFoundException("Visit not found"));
        if (reason != null) visit.setReason(reason);
        if (notes != null) visit.setNotes(notes);
        return VisitMapper.toDto(visit);
    }

    // --- Private helpers (encapsulated validation) ---

    private boolean canView(Visit visit) {
        if (currentUserService.hasAnyRole(Role.ADMIN, Role.VET)) return true;
        if (visit.getPet() == null || visit.getPet().getOwner() == null) return false;
        Long ownerId = visit.getPet().getOwner().getId();
        return ownerId != null && ownerId.equals(currentUserService.getCurrentUserId());
    }

    private void validateRequired(LocalDate date, LocalTime start) {
        if (date == null || start == null) {
            throw new IllegalArgumentException("Visit date and start time must be provided");
        }
    }

    private void validateTemporal(LocalDate date, LocalTime start) {
        LocalDate today = LocalDate.now();
        if (date.isBefore(today)) {
            throw new IllegalArgumentException("Visit date cannot be in the past");
        }
        if (date.isEqual(today) && start.isBefore(LocalTime.now())) {
            throw new IllegalArgumentException("Visit start time cannot be in the past");
        }
    }

    private VetScheduleEntry findScheduleEntry(VetProfile vetProfile, LocalDate date, LocalTime requestedStart) {
        List<VetScheduleEntry> weekly = vetScheduleService.getScheduleForVetProfile(vetProfile.getId());
        return weekly.stream()
                .filter(e -> e.getDayOfWeek().equals(date.getDayOfWeek()))
                .filter(e -> withinEntry(requestedStart, e))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Requested time is outside vet working hours"));
    }

    private boolean withinEntry(LocalTime requestedStart, VetScheduleEntry entry) {
        LocalTime blockStart = entry.getStartTime();
        LocalTime blockEnd = entry.getEndTime();
        int slotLen = entry.getSlotLengthMinutes();
        if (requestedStart.isBefore(blockStart) || !requestedStart.isBefore(blockEnd)) return false;
        long minutesFromStart = java.time.Duration.between(blockStart, requestedStart).toMinutes();
        return minutesFromStart % slotLen == 0;
    }

    private void validateNotOnTimeOff(VetProfile vetProfile, LocalDate date) {
        if (vetTimeOffService.isVetOnTimeOffOnDate(vetProfile, date)) {
            throw new IllegalArgumentException("Vet is on time off on the selected date");
        }
    }

    private void validateNoConflict(VetProfile vetProfile, LocalDate date, LocalTime start, LocalTime end) {
        boolean hasConflict = visitRepository.existsByVetProfileAndDateAndStatusInAndStartTimeLessThanAndEndTimeGreaterThan(
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
