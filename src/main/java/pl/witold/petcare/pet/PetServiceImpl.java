package pl.witold.petcare.pet;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pl.witold.petcare.exceptions.PetNotFoundException;
import pl.witold.petcare.exceptions.UserNotFoundException;
import pl.witold.petcare.pet.commands.PetCreateCommand;
import pl.witold.petcare.pet.commands.PetUpdateCommand;
import pl.witold.petcare.user.User;
import pl.witold.petcare.user.UserRepository;

import java.util.List;

/**
 * Implementation of PetService interface.
 * Contains business logic for managing pets.
 */
@Service
@RequiredArgsConstructor
@Transactional
public class PetServiceImpl implements PetService {

    private final PetRepository petRepository;
    private final UserRepository userRepository;

    @Override
    public Pet create(PetCreateCommand command) {
        User owner = getOwnerOrThrow(command.ownerId());

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
        Pet pet = getById(petId);

        if (!command.ownerId().equals(pet.getOwner().getId())) {
            User newOwner = getOwnerOrThrow(command.ownerId());
            pet.setOwner(newOwner);
        }

        pet.setName(command.name());
        pet.setSpecies(command.species());
        pet.setSex(command.sex());
        pet.setBreed(command.breed());
        pet.setBirthYear(command.birthYear());
        pet.setBirthDate(command.birthDate());
        pet.setWeight(command.weight());
        pet.setNotes(command.notes());

        return petRepository.save(pet);
    }

    @Override
    @Transactional(readOnly = true)
    public Pet getById(Long id) {
        return petRepository.findByIdWithOwner(id)
                .orElseThrow(() -> new PetNotFoundException("Pet with ID " + id + " not found"));
    }

    @Override
    @Transactional(readOnly = true)
    public List<Pet> getAll() {
        return petRepository.findAllWithOwner();
    }

    @Override
    @Transactional(readOnly = true)
    public List<Pet> getByOwnerId(Long ownerId) {
        return petRepository.findByOwnerIdWithOwner(ownerId);
    }

    @Override
    public void deleteById(Long id) {
        Pet pet = getById(id);
        petRepository.delete(pet);
    }

    private User getOwnerOrThrow(Long ownerId) {
        return userRepository.findById(ownerId)
                .orElseThrow(() -> new UserNotFoundException("Owner with ID " + ownerId + " not found"));
    }
}
