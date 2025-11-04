package pl.witold.petcare.pet;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pl.witold.petcare.user.User;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class PetServiceImpl implements PetService {

    private final PetRepository pets;

    public PetServiceImpl(PetRepository pets) {
        this.pets = pets;
    }

    @Override
    @Transactional(readOnly = true)
    public List<Pet> findPetsForOwner(User owner) {
        return pets.findByOwnerOrderByNameAsc(owner);
    }

    @Override
    public Pet createPetForOwner(User owner,
                                 String name,
                                 String species,
                                 String breed,
                                 LocalDate dateOfBirth,
                                 String notes) {
        Pet pet = new Pet(
                owner,
                name,
                species,
                breed,
                dateOfBirth,
                notes
        );
        return pets.save(pet);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<Pet> findByIdAndOwner(Long id, User owner) {
        return pets.findById(id)
                .filter(p -> p.getOwner().getId().equals(owner.getId()));
    }

    @Override
    public void deleteByIdAndOwner(Long id, User owner) {
        pets.findById(id)
                .filter(p -> p.getOwner().getId().equals(owner.getId()))
                .ifPresent(pets::delete);
    }
}
