package pl.witold.petcare.pet;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import pl.witold.petcare.dto.PetImportDto;
import pl.witold.petcare.dto.PetResponseDto;
import pl.witold.petcare.pet.commands.PetCreateCommand;
import pl.witold.petcare.pet.commands.PetUpdateCommand;

import java.util.List;

public interface PetService {
    Pet create(PetCreateCommand command);

    Pet update(Long petId, PetUpdateCommand command);

    Pet getById(Long id);

    List<Pet> getAll();

    Page<Pet> getAll(Pageable pageable);

    List<Pet> getByOwnerId(Long ownerId);

    Page<Pet> getByOwnerId(Long ownerId, Pageable pageable);

    List<PetResponseDto> getByOwnerIdAsDto(Long ownerId);

    void deleteById(Long id);

    List<Pet> importForOwner(Long ownerId, List<PetImportDto> pets);
}
