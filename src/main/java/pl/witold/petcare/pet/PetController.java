package pl.witold.petcare.pet;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import pl.witold.petcare.dto.PetImportDto;
import pl.witold.petcare.dto.PetResponseDto;
import pl.witold.petcare.pet.commands.PetCreateCommand;
import pl.witold.petcare.pet.commands.PetUpdateCommand;
import pl.witold.petcare.user.User;
import pl.witold.petcare.user.UserService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.ArraySchema;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.parameters.RequestBody;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;

import java.util.List;

/**
 * REST controller for managing pets.
 */
@Tag(
        name = "Pets",
        description = "Managing pets: creation, update, deletion and listing for owners and vets"
)
@RestController
@RequestMapping("/api/pets")
@RequiredArgsConstructor
public class PetController {

    private final PetService petService;
    private final UserService userService;

    /**
     * Creates a new pet.
     */
    @Operation(
            summary = "Create a new pet",
            description = "Creates a new pet record. Typically used by vets or admins, "
                    + "but can also be used in owner-facing flows."
    )
    @ApiResponse(
            responseCode = "200",
            description = "Pet created successfully",
            content = @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = PetResponseDto.class)
            )
    )
    @PostMapping
    public ResponseEntity<PetResponseDto> create(
            @Valid
            @RequestBody(
                    description = "Payload with basic pet information",
                    required = true,
                    content = @Content(
                            schema = @Schema(implementation = PetCreateCommand.class)
                    )
            )
            @org.springframework.web.bind.annotation.RequestBody PetCreateCommand command
    ) {
        Pet pet = petService.create(command);
        return ResponseEntity.ok(PetMapper.toDto(pet));
    }

    /**
     * Export current user's pets as a JSON array of PetImportDto.
     */
    @Operation(
            summary = "Export current user's pets",
            description = "Returns a JSON array of pets for the current user, without IDs/owner info."
    )
    @ApiResponse(
            responseCode = "200",
            description = "Exported pets",
            content = @Content(
                    mediaType = "application/json",
                    array = @ArraySchema(schema = @Schema(implementation = PetImportDto.class))
            )
    )
    @GetMapping("/me/export")
    public ResponseEntity<List<PetImportDto>> exportMyPets(Authentication authentication) {
        User currentUser = userService.getByUsername(authentication.getName());
        List<PetImportDto> exported = petService.getByOwnerId(currentUser.getId())
                .stream()
                .map(PetMapper::toImportDto)
                .toList();
        if (exported.isEmpty()) {
            throw new IllegalArgumentException("No pets to export for current user");
        }
        return ResponseEntity.ok(exported);
    }

    /**
     * Import pets from JSON and assign them to the current user. New IDs will be generated.
     */
    @Operation(
            summary = "Import pets for current user",
            description = "Accepts a JSON array of pets and creates them for the current user. New IDs are generated."
    )
    @ApiResponse(
            responseCode = "200",
            description = "Imported pets",
            content = @Content(
                    mediaType = "application/json",
                    array = @ArraySchema(schema = @Schema(implementation = PetResponseDto.class))
            )
    )
    @PostMapping("/me/import")
    public ResponseEntity<List<PetResponseDto>> importMyPets(
            Authentication authentication,
            @Valid @org.springframework.web.bind.annotation.RequestBody List<PetImportDto> payload
    ) {
        if (payload == null || payload.isEmpty()) {
            throw new IllegalArgumentException("At least one pet must be provided for import");
        }
        User currentUser = userService.getByUsername(authentication.getName());
        List<PetResponseDto> created = petService.importForOwner(currentUser.getId(), payload)
                .stream()
                .map(PetMapper::toDto)
                .toList();
        return ResponseEntity.ok(created);
    }

    /**
     * Returns all pets.
     * Intended mainly for VET / ADMIN usage.
     */
    @Operation(
            summary = "Get all pets",
            description = "Returns a paginated list of all pets in the system. Intended mainly for VET and ADMIN usage. " +
                    "Supports pagination with parameters: page (default: 0), size (default: 20, max: 100), sort (e.g., name,asc)."
    )
    @ApiResponse(
            responseCode = "200",
            description = "Paginated list of pets returned successfully",
            content = @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = Page.class)
            )
    )
    @GetMapping
    public ResponseEntity<Page<PetResponseDto>> getAll(
            @PageableDefault(size = 20, sort = "name") Pageable pageable
    ) {
        Page<Pet> pets = petService.getAll(pageable);
        Page<PetResponseDto> result = pets.map(PetMapper::toDto);
        return ResponseEntity.ok(result);
    }

    /**
     * Returns a single pet by its ID.
     */
    @Operation(
            summary = "Get pet by id",
            description = "Returns a single pet by its identifier. Access control for owners vs vets/admins "
                    + "is enforced by service/guards."
    )
    @ApiResponse(
            responseCode = "200",
            description = "Pet found and returned",
            content = @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = PetResponseDto.class)
            )
    )
    @ApiResponse(
            responseCode = "404",
            description = "Pet not found"
    )
    @GetMapping("/{id}")
    public ResponseEntity<PetResponseDto> getById(
            @Parameter(description = "Pet id", example = "1")
            @PathVariable Long id
    ) {
        Pet pet = petService.getById(id);
        return ResponseEntity.ok(PetMapper.toDto(pet));
    }

    /**
     * Returns pets for a specific owner ID.
     * Useful for vet/admin views.
     */
    @Operation(
            summary = "Get pets by owner id",
            description = "Returns a paginated list of pets belonging to the given owner id. Useful for vet/admin views. " +
                    "Supports pagination with parameters: page (default: 0), size (default: 20, max: 100), sort (e.g., name,asc)."
    )
    @ApiResponse(
            responseCode = "200",
            description = "Paginated list of pets for the given owner returned successfully",
            content = @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = Page.class)
            )
    )
    @GetMapping("/owner/{ownerId}")
    public ResponseEntity<Page<PetResponseDto>> getByOwner(
            @Parameter(description = "Owner id", example = "1")
            @PathVariable Long ownerId,
            @PageableDefault(size = 20, sort = "name") Pageable pageable
    ) {
        Page<Pet> pets = petService.getByOwnerId(ownerId, pageable);
        Page<PetResponseDto> result = pets.map(PetMapper::toDto);
        return ResponseEntity.ok(result);
    }

    /**
     * Returns pets for currently authenticated user.
     */
    @Operation(
            summary = "Get current user's pets",
            description = "Returns pets belonging to the currently authenticated user."
    )
    @ApiResponse(
            responseCode = "200",
            description = "List of current user's pets returned successfully",
            content = @Content(
                    mediaType = "application/json",
                    array = @ArraySchema(schema = @Schema(implementation = PetResponseDto.class))
            )
    )
    @ApiResponse(
            responseCode = "401",
            description = "User is not authenticated"
    )
    @GetMapping("/me")
    public ResponseEntity<List<PetResponseDto>> getMyPets(Authentication authentication) {
        User currentUser = userService.getByUsername(authentication.getName());
        List<PetResponseDto> result = petService.getByOwnerId(currentUser.getId())
                .stream()
                .map(PetMapper::toDto)
                .toList();
        return ResponseEntity.ok(result);
    }

    /**
     * Updates an existing pet.
     */
    @Operation(
            summary = "Update pet data",
            description = "Updates an existing pet. Ownership and role checks should be handled in the service layer."
    )
    @ApiResponse(
            responseCode = "200",
            description = "Pet updated successfully",
            content = @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = PetResponseDto.class)
            )
    )
    @ApiResponse(
            responseCode = "404",
            description = "Pet not found"
    )
    @PutMapping("/{id}")
    public ResponseEntity<PetResponseDto> update(
            @Parameter(description = "Pet id", example = "1")
            @PathVariable Long id,
            @Valid
            @RequestBody(
                    description = "Updated pet data",
                    required = true,
                    content = @Content(
                            schema = @Schema(implementation = PetUpdateCommand.class)
                    )
            )
            @org.springframework.web.bind.annotation.RequestBody PetUpdateCommand command
    ) {
        Pet updated = petService.update(id, command);
        return ResponseEntity.ok(PetMapper.toDto(updated));
    }

    /**
     * Deletes an existing pet.
     */
    @Operation(
            summary = "Delete pet",
            description = "Deletes an existing pet by id. Ownership/role checks are enforced by guards/service."
    )
    @ApiResponse(
            responseCode = "204",
            description = "Pet deleted successfully"
    )
    @ApiResponse(
            responseCode = "404",
            description = "Pet not found"
    )
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @Parameter(description = "Pet id", example = "1")
            @PathVariable Long id
    ) {
        petService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
