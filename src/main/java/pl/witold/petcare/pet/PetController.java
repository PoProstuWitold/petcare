package pl.witold.petcare.pet;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import pl.witold.petcare.dto.PetResponseDto;
import pl.witold.petcare.pet.commands.PetCreateCommand;
import pl.witold.petcare.pet.commands.PetUpdateCommand;
import pl.witold.petcare.user.User;
import pl.witold.petcare.user.UserService;

import java.util.List;
import java.util.stream.Collectors;

/**
 * REST controller for managing pets.
 */
@RestController
@RequestMapping("/api/pets")
@RequiredArgsConstructor
public class PetController {

    private final PetService petService;
    private final UserService userService;

    /**
     * Creates a new pet.
     */
    @PostMapping
    public ResponseEntity<PetResponseDto> create(@Valid @RequestBody PetCreateCommand command) {
        Pet pet = petService.create(command);
        return ResponseEntity.ok(PetMapper.toDto(pet));
    }

    /**
     * Returns all pets.
     * Intended mainly for VET / ADMIN usage.
     */
    @GetMapping
    public ResponseEntity<List<PetResponseDto>> getAll() {
        List<PetResponseDto> result = petService.getAll()
                .stream()
                .map(PetMapper::toDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(result);
    }

    /**
     * Returns a single pet by its ID.
     */
    @GetMapping("/{id}")
    public ResponseEntity<PetResponseDto> getById(@PathVariable Long id) {
        Pet pet = petService.getById(id);
        return ResponseEntity.ok(PetMapper.toDto(pet));
    }

    /**
     * Returns pets for a specific owner ID.
     * Useful for vet/admin views.
     */
    @GetMapping("/owner/{ownerId}")
    public ResponseEntity<List<PetResponseDto>> getByOwner(@PathVariable Long ownerId) {
        List<PetResponseDto> result = petService.getByOwnerId(ownerId)
                .stream()
                .map(PetMapper::toDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(result);
    }

    /**
     * Returns pets for currently authenticated user.
     */
    @GetMapping("/me")
    public ResponseEntity<List<PetResponseDto>> getMyPets(Authentication authentication) {
        User currentUser = userService.getByUsername(authentication.getName());
        List<PetResponseDto> result = petService.getByOwnerId(currentUser.getId())
                .stream()
                .map(PetMapper::toDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(result);
    }

    /**
     * Updates an existing pet.
     */
    @PutMapping("/{id}")
    public ResponseEntity<PetResponseDto> update(
            @PathVariable Long id,
            @Valid @RequestBody PetUpdateCommand command
    ) {
        Pet updated = petService.update(id, command);
        return ResponseEntity.ok(PetMapper.toDto(updated));
    }

    /**
     * Deletes an existing pet.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        petService.deleteById(id);
        return ResponseEntity.noContent().build();
    }

}
