package pl.witold.petcare.pet;

import pl.witold.petcare.user.User;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface PetService {

    List<Pet> findPetsForOwner(User owner);

    Pet createPetForOwner(User owner,
                          String name,
                          String species,
                          String sex,
                          String breed,
                          LocalDate birthDate,
                          Integer birthYear,
                          Double weight,
                          String notes);

    Optional<Pet> findByIdAndOwner(Long id, User owner);

    void deleteByIdAndOwner(Long id, User owner);
}
