package pl.witold.petcare.pet;

import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pl.witold.petcare.exceptions.PetNotFoundException;
import pl.witold.petcare.exceptions.UserNotFoundException;
import pl.witold.petcare.pet.commands.PetCreateCommand;
import pl.witold.petcare.pet.commands.PetUpdateCommand;
import pl.witold.petcare.security.CurrentUserService;
import pl.witold.petcare.user.Role;
import pl.witold.petcare.user.User;
import pl.witold.petcare.user.UserRepository;

import java.util.List;

/**
 * Implementation of PetService interface.
 * Contains business logic for creating, updating and deleting pets
 * and enforces access rules based on the current authenticated user.
 */
@Service
@RequiredArgsConstructor
@Transactional
public class PetServiceImpl implements PetService {

    private final PetRepository petRepository;
    private final UserRepository userRepository;
    private final CurrentUserService currentUserService;
    private final PetAccessService petAccessService;

    @Override
    public Pet create(PetCreateCommand command) {
        User owner = resolveOwnerForCreate(command.ownerId());

        Pet pet = new Pet(
                owner,
                command.name(),
                command.species(),
                command.sex(),
                command.breed(),
                command.birthDate(),
                command.birthYear(),
                command.weight(),
                command.notes()
        );

        return petRepository.save(pet);
    }

    @Override
    public Pet update(Long petId, PetUpdateCommand command) {
        Pet pet = getByIdWithOwner(petId);
        petAccessService.checkCanModify(pet);

        User owner = resolveOwnerForUpdate(command.ownerId(), pet);

        pet.setOwner(owner);
        pet.setName(command.name());
        pet.setSpecies(command.species());
        pet.setSex(command.sex());
        pet.setBreed(command.breed());
        pet.setBirthDate(command.birthDate());
        pet.setBirthYear(command.birthYear());
        pet.setWeight(command.weight());
        pet.setNotes(command.notes());

        return petRepository.save(pet);
    }

    @Override
    @Transactional(readOnly = true)
    public Pet getById(Long id) {
        Pet pet = getByIdWithOwner(id);
        petAccessService.checkCanView(pet);
        return pet;
    }

    @Override
    @Transactional(readOnly = true)
    public List<Pet> getAll() {
        // Only vets and admins are allowed to see all pets.
        if (!(currentUserService.hasRole(Role.ADMIN) || currentUserService.hasRole(Role.VET))) {
            throw new AccessDeniedException("You are not allowed to access all pets");
        }
        return petRepository.findAllWithOwner();
    }

    @Override
    @Transactional(readOnly = true)
    public List<Pet> getByOwnerId(Long ownerId) {
        enforceOwnerScope(ownerId);
        return petRepository.findByOwnerIdWithOwner(ownerId);
    }

    @Override
    public void deleteById(Long id) {
        Pet pet = getByIdWithOwner(id);
        petAccessService.checkCanModify(pet);
        petRepository.delete(pet);
    }

    private Pet getByIdWithOwner(Long id) {
        return petRepository.findByIdWithOwner(id)
                .orElseThrow(() -> new PetNotFoundException("Pet with ID " + id + " not found"));
    }

    private User resolveOwnerForCreate(Long requestedOwnerId) {
        User currentUser = currentUserService.getCurrentUser();
        boolean elevated = currentUserService.hasRole(Role.ADMIN) || currentUserService.hasRole(Role.VET);

        if (elevated) {
            return getOwnerOrThrow(requestedOwnerId);
        }

        if (!currentUser.getId().equals(requestedOwnerId)) {
            throw new AccessDeniedException("You are not allowed to create pets for another user");
        }
        return currentUser;
    }

    private User resolveOwnerForUpdate(Long requestedOwnerId, Pet pet) {
        boolean elevated = currentUserService.hasRole(Role.ADMIN) || currentUserService.hasRole(Role.VET);
        if (elevated) {
            if (!pet.getOwner().getId().equals(requestedOwnerId)) {
                return getOwnerOrThrow(requestedOwnerId);
            }
            return pet.getOwner();
        }
        User currentUser = currentUserService.getCurrentUser();
        if (!pet.getOwner().getId().equals(currentUser.getId()) || !requestedOwnerId.equals(currentUser.getId())) {
            throw new AccessDeniedException("You are not allowed to change pet owner");
        }
        return pet.getOwner();
    }

    private void enforceOwnerScope(Long ownerId) {
        User currentUser = currentUserService.getCurrentUser();
        boolean elevated = currentUserService.hasRole(Role.ADMIN) || currentUserService.hasRole(Role.VET);

        if (!elevated && !currentUser.getId().equals(ownerId)) {
            throw new AccessDeniedException("You are not allowed to access pets for this owner");
        }
    }

    private User getOwnerOrThrow(Long ownerId) {
        return userRepository.findById(ownerId)
                .orElseThrow(() -> new UserNotFoundException("Owner with ID " + ownerId + " not found"));
    }
}
