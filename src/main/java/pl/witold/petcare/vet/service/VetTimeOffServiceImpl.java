package pl.witold.petcare.vet.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pl.witold.petcare.exceptions.VetTimeOffNotFoundException;
import pl.witold.petcare.vet.VetProfile;
import pl.witold.petcare.vet.VetTimeOff;
import pl.witold.petcare.vet.commands.*;
import pl.witold.petcare.vet.repository.VetTimeOffRepository;

import java.time.LocalDate;
import java.util.List;

/**
 * Implementation of VetTimeOffService containing business logic for vet time-off management.
 */
@Service
@RequiredArgsConstructor
@Transactional
public class VetTimeOffServiceImpl implements VetTimeOffService {

    private final VetTimeOffRepository vetTimeOffRepository;
    private final VetProfileService vetProfileService;

    @Override
    @Transactional(readOnly = true)
    public List<VetTimeOff> getTimeOffForCurrentVet() {
        VetProfile profile = vetProfileService.getOrCreateCurrentVetProfile();
        return vetTimeOffRepository.findByVetProfileOrderByStartDateAsc(profile);
    }

    @Override
    public VetTimeOff createTimeOffForCurrentVet(VetTimeOffCreateCommand command) {
        VetProfile profile = currentProfile();

        validateDates(command.startDate(), command.endDate());

        VetTimeOff timeOff = new VetTimeOff();
        timeOff.setVetProfile(profile);
        timeOff.setStartDate(command.startDate());
        timeOff.setEndDate(command.endDate());
        timeOff.setReason(command.reason());

        return vetTimeOffRepository.save(timeOff);
    }

    @Override
    public void deleteTimeOffForCurrentVet(Long id) {
        VetProfile profile = currentProfile();

        VetTimeOff timeOff = vetTimeOffRepository.findByIdAndVetProfile(id, profile)
                .orElseThrow(() -> new VetTimeOffNotFoundException(
                        "Time-off entry with ID " + id + " not found for current vet"
                ));

        vetTimeOffRepository.delete(timeOff);
    }

    @Override
    @Transactional(readOnly = true)
    public List<VetTimeOff> getTimeOffForVetProfile(Long vetProfileId) {
        VetProfile profile = vetProfileService.getById(vetProfileId);
        return vetTimeOffRepository.findByVetProfileOrderByStartDateAsc(profile);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean isVetOnTimeOffOnDate(VetProfile vetProfile, LocalDate date) {
        List<VetTimeOff> list = vetTimeOffRepository
                .findByVetProfileAndEndDateGreaterThanEqualAndStartDateLessThanEqual(
                        vetProfile, date, date
                );
        return !list.isEmpty();
    }

    private void validateDates(LocalDate start, LocalDate end) {
        if (start == null || end == null) {
            throw new IllegalArgumentException("Start date and end date must not be null");
        }
        if (end.isBefore(start)) {
            throw new IllegalArgumentException("End date cannot be before start date");
        }
    }

    private VetProfile currentProfile() {
        return vetProfileService.getOrCreateCurrentVetProfile();
    }
}
