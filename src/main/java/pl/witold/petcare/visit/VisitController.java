package pl.witold.petcare.visit;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import pl.witold.petcare.dto.VisitResponseDto;
import pl.witold.petcare.visit.commands.VisitCreateCommand;
import pl.witold.petcare.visit.commands.VisitStatusUpdateCommand;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.ArraySchema;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.parameters.RequestBody;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;

import java.time.LocalDate;
import java.util.List;

/**
 * REST controller exposing endpoints for booking and listing visits.
 */
@Tag(
        name = "Visits",
        description = "Booking, listing and managing veterinary visits"
)
@RestController
@RequestMapping("/api/visits")
@RequiredArgsConstructor
public class VisitController {

    private final VisitService visitService;

    /**
     * POST /api/visits
     * Creates a new visit.
     */
    @Operation(
            summary = "Create a new visit",
            description = "Creates a new visit for a given pet and vet profile."
    )
    @ApiResponse(
            responseCode = "201",
            description = "Visit created successfully",
            content = @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = VisitResponseDto.class)
            )
    )
    @ApiResponse(
            responseCode = "400",
            description = "Validation error in visit creation payload"
    )
    @PostMapping
    public ResponseEntity<VisitResponseDto> createVisit(
            @Valid
            @RequestBody(
                    description = "Payload with data required to create a new visit",
                    required = true,
                    content = @Content(
                            schema = @Schema(implementation = VisitCreateCommand.class)
                    )
            )
            @org.springframework.web.bind.annotation.RequestBody VisitCreateCommand command
    ) {
        Visit created = visitService.createVisit(command);
        return ResponseEntity.status(HttpStatus.CREATED).body(VisitMapper.toDto(created));
    }

    /**
     * GET /api/visits/by-pet/{petId}
     * Returns all visits for the given pet.
     */
    @Operation(
            summary = "Get visits for a pet",
            description = "Returns all visits for the given pet id."
    )
    @ApiResponse(
            responseCode = "200",
            description = "List of visits for the pet returned successfully",
            content = @Content(
                    mediaType = "application/json",
                    array = @ArraySchema(schema = @Schema(implementation = VisitResponseDto.class))
            )
    )
    @GetMapping("/by-pet/{petId}")
    public ResponseEntity<List<VisitResponseDto>> getVisitsForPet(
            @Parameter(description = "Pet id", example = "1")
            @PathVariable Long petId
    ) {
        List<VisitResponseDto> result = visitService.getVisitsForPet(petId).stream()
                .map(VisitMapper::toDto)
                .toList();

        return ResponseEntity.ok(result);
    }

    /**
     * GET /api/visits/by-vet/{vetProfileId}?date=YYYY-MM-DD
     * Returns all visits for a given vet profile on a specific date.
     * Used by booking UI to block already taken slots.
     */
    @Operation(
            summary = "Get visits for vet and date",
            description = "Returns all visits for a given vet profile on a specific date. "
                    + "Typically used by booking UI to block already taken slots."
    )
    @ApiResponse(
            responseCode = "200",
            description = "List of visits for the vet and date returned successfully",
            content = @Content(
                    mediaType = "application/json",
                    array = @ArraySchema(schema = @Schema(implementation = VisitResponseDto.class))
            )
    )
    @Transactional(readOnly = true)
    @GetMapping("/by-vet/{vetProfileId}")
    public ResponseEntity<List<VisitResponseDto>> getVisitsForVetAndDate(
            @Parameter(description = "Vet profile id", example = "1")
            @PathVariable Long vetProfileId,
            @Parameter(
                    description = "Date for which visits should be returned",
                    example = "2025-11-10"
            )
            @RequestParam("date") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date
    ) {
        List<VisitResponseDto> result =
                visitService.getVisitsForVetAndDate(vetProfileId, date).stream()
                        .map(VisitMapper::toDto)
                        .toList();

        return ResponseEntity.ok(result);
    }

    @Operation(
            summary = "Get visits for current vet",
            description = "Returns all visits assigned to the currently authenticated vet."
    )
    @ApiResponse(
            responseCode = "200",
            description = "List of visits for the current vet returned successfully",
            content = @Content(
                    mediaType = "application/json",
                    array = @ArraySchema(schema = @Schema(implementation = VisitResponseDto.class))
            )
    )
    @GetMapping("/me")
    public ResponseEntity<List<VisitResponseDto>> getMyVisits() {
        List<VisitResponseDto> result = visitService.getVisitsForCurrentVet().stream()
                .map(VisitMapper::toDto)
                .toList();

        return ResponseEntity.ok(result);
    }

    @Operation(
            summary = "Update visit status",
            description = "Updates the status of a visit (e.g. SCHEDULED, COMPLETED, CANCELLED)."
    )
    @ApiResponse(
            responseCode = "200",
            description = "Visit status updated successfully",
            content = @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = VisitResponseDto.class)
            )
    )
    @ApiResponse(
            responseCode = "404",
            description = "Visit not found"
    )
    @PatchMapping("/{visitId}/status")
    public ResponseEntity<VisitResponseDto> updateStatus(
            @Parameter(description = "Visit id", example = "1")
            @PathVariable Long visitId,
            @Valid
            @RequestBody(
                    description = "Payload with new visit status",
                    required = true,
                    content = @Content(
                            schema = @Schema(implementation = VisitStatusUpdateCommand.class)
                    )
            )
            @org.springframework.web.bind.annotation.RequestBody VisitStatusUpdateCommand command
    ) {
        VisitResponseDto dto = visitService.updateVisitStatus(visitId, command.status());
        return ResponseEntity.ok(dto);
    }

    /**
     * GET /api/visits/{id}
     * Returns the visit with the given id.
     */
    @Operation(
            summary = "Get visit by ID",
            description = "Returns the visit details for the given visit ID."
    )
    @ApiResponse(
            responseCode = "200",
            description = "Visit details returned successfully",
            content = @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = VisitResponseDto.class)
            )
    )
    @ApiResponse(
            responseCode = "404",
            description = "Visit not found"
    )
    @GetMapping("/{visitId}")
    public ResponseEntity<VisitResponseDto> getVisitById(@PathVariable Long visitId) {
        Visit visit = visitService.getById(visitId);
        return ResponseEntity.ok(VisitMapper.toDto(visit));
    }
}
