package pl.witold.petcare.vet.service;

import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pl.witold.petcare.exceptions.VetProfileNotFoundException;
import pl.witold.petcare.security.CurrentUserService;
import pl.witold.petcare.user.Role;
import pl.witold.petcare.user.User;
import pl.witold.petcare.vet.VetProfile;
import pl.witold.petcare.vet.VetSpecialization;
import pl.witold.petcare.vet.commands.VetProfileUpdateCommand;
import pl.witold.petcare.vet.repository.VetProfileRepository;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

/**
 * Implementation of VetProfileService containing business logic for vet profiles.
 */
@Service
@RequiredArgsConstructor
@Transactional
public class VetProfileServiceImpl implements VetProfileService {

    private final VetProfileRepository vetProfileRepository;
    private final CurrentUserService currentUserService;

    @Override
    public VetProfile getOrCreateCurrentVetProfile() {
        User currentVet = getCurrentVetUserOrThrow();

        return vetProfileRepository.findByUserId(currentVet.getId())
                .orElseGet(() -> {
                    VetProfile profile = new VetProfile(currentVet);
                    return vetProfileRepository.save(profile);
                });
    }

    @Override
    public VetProfile updateCurrentVetProfile(VetProfileUpdateCommand command) {
        VetProfile profile = getOrCreateCurrentVetProfile();

        profile.setBio(command.bio());
        profile.setAcceptsNewPatients(Boolean.TRUE.equals(command.acceptsNewPatients()));
        profile.setAverageVisitLengthMinutes(command.averageVisitLengthMinutes());

        Set<VetSpecialization> newSpecs = command.specializations() != null
                ? new HashSet<>(command.specializations())
                : new HashSet<>();

        profile.getSpecializations().clear();
        profile.getSpecializations().addAll(newSpecs);

        return vetProfileRepository.save(profile);
    }

    @Override
    @Transactional(readOnly = true)
    public VetProfile getById(Long id) {
        return vetProfileRepository.findById(id)
                .orElseThrow(() -> new VetProfileNotFoundException("Vet profile with ID " + id + " not found"));
    }

    @Override
    @Transactional(readOnly = true)
    public List<VetProfile> getAllProfiles() {
        return vetProfileRepository.findAll();
    }

    private User getCurrentVetUserOrThrow() {
        User currentUser = currentUserService.getCurrentUser();

        boolean isVet = currentUser.getRoles().contains(Role.VET);
        if (!isVet) {
            throw new AccessDeniedException("Only vets can manage vet profile data");
        }

        return currentUser;
    }
}
