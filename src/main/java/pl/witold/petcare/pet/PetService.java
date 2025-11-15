package pl.witold.petcare.pet;

import pl.witold.petcare.dto.PetImportDto;
import pl.witold.petcare.pet.commands.PetCreateCommand;
import pl.witold.petcare.pet.commands.PetUpdateCommand;

import java.util.List;

public interface PetService {
    Pet create(PetCreateCommand command);
    Pet update(Long petId, PetUpdateCommand command);
    Pet getById(Long id);
    List<Pet> getAll();
    List<Pet> getByOwnerId(Long ownerId);
    void deleteById(Long id);
    List<Pet> importForOwner(Long ownerId, List<PetImportDto> pets);
}
