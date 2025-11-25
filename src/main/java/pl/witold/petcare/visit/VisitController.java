package pl.witold.petcare.visit;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.parameters.RequestBody;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import pl.witold.petcare.dto.VisitResponseDto;
import pl.witold.petcare.visit.commands.VisitCreateCommand;
import pl.witold.petcare.visit.commands.VisitPartialUpdateCommand;
import pl.witold.petcare.visit.commands.VisitStatusUpdateCommand;

import java.time.LocalDate;

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
            description = "Returns a paginated list of visits for the given pet id. " +
                    "Supports pagination with parameters: page (default: 0), size (default: 20, max: 100), sort (e.g., date,asc)."
    )
    @ApiResponse(
            responseCode = "200",
            description = "Paginated list of visits for the pet returned successfully",
            content = @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = Page.class)
            )
    )
    @GetMapping("/by-pet/{petId}")
    public ResponseEntity<Page<VisitResponseDto>> getVisitsForPet(
            @Parameter(description = "Pet id", example = "1")
            @PathVariable Long petId,
            @PageableDefault(size = 20) Pageable pageable
    ) {
        Page<Visit> visits = visitService.getVisitsForPet(petId, pageable);
        Page<VisitResponseDto> result = visits.map(VisitMapper::toDto);
        return ResponseEntity.ok(result);
    }

    /**
     * GET /api/visits/by-vet/{vetProfileId}?date=YYYY-MM-DD
     * Returns all visits for a given vet profile on a specific date.
     * Used by booking UI to block already taken slots.
     */
    @Operation(
            summary = "Get visits for vet and date",
            description = "Returns a paginated list of visits for a given vet profile on a specific date. "
                    + "Typically used by booking UI to block already taken slots. " +
                    "Supports pagination with parameters: page (default: 0), size (default: 20, max: 100), sort (e.g., startTime,asc)."
    )
    @ApiResponse(
            responseCode = "200",
            description = "Paginated list of visits for the vet and date returned successfully",
            content = @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = Page.class)
            )
    )
    @Transactional(readOnly = true)
    @GetMapping("/by-vet/{vetProfileId}")
    public ResponseEntity<Page<VisitResponseDto>> getVisitsForVetAndDate(
            @Parameter(description = "Vet profile id", example = "1")
            @PathVariable Long vetProfileId,
            @Parameter(
                    description = "Date for which visits should be returned",
                    example = "2025-11-10"
            )
            @RequestParam("date") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @PageableDefault(size = 20) Pageable pageable
    ) {
        Page<Visit> visits = visitService.getVisitsForVetAndDate(vetProfileId, date, pageable);
        Page<VisitResponseDto> result = visits.map(VisitMapper::toDto);
        return ResponseEntity.ok(result);
    }

    @Operation(
            summary = "Get visits for current vet",
            description = "Returns a paginated list of visits assigned to the currently authenticated vet. " +
                    "Supports pagination with parameters: page (default: 0), size (default: 20, max: 100), sort (e.g., date,asc)."
    )
    @ApiResponse(
            responseCode = "200",
            description = "Paginated list of visits for the current vet returned successfully",
            content = @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = Page.class)
            )
    )
    @GetMapping("/me")
    public ResponseEntity<Page<VisitResponseDto>> getMyVisits(
            @PageableDefault(size = 20) Pageable pageable
    ) {
        Page<Visit> visits = visitService.getVisitsForCurrentVet(pageable);
        Page<VisitResponseDto> result = visits.map(VisitMapper::toDto);
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

    @Operation(
            summary = "Delete visit",
            description = "Deletes a visit by id. Admin/Vet only."
    )
    @ApiResponse(responseCode = "204", description = "Visit deleted successfully")
    @ApiResponse(responseCode = "404", description = "Visit not found")
    @DeleteMapping("/{visitId}")
    public ResponseEntity<Void> deleteVisit(
            @Parameter(description = "Visit id", example = "1")
            @PathVariable Long visitId
    ) {
        visitService.deleteById(visitId);
        return ResponseEntity.noContent().build();
    }

    @Operation(
            summary = "Update visit notes/reason",
            description = "Updates editable fields (reason, notes) of a visit. Admin/Vet only."
    )
    @ApiResponse(responseCode = "200", description = "Visit updated successfully", content = @Content(mediaType = "application/json", schema = @Schema(implementation = VisitResponseDto.class)))
    @ApiResponse(responseCode = "404", description = "Visit not found")
    @PatchMapping("/{visitId}")
    public ResponseEntity<VisitResponseDto> updateVisitFields(
            @Parameter(description = "Visit id", example = "1")
            @PathVariable Long visitId,
            @Valid
            @RequestBody(
                    description = "Partial update payload for visit reason/notes",
                    required = true,
                    content = @Content(
                            schema = @Schema(implementation = VisitPartialUpdateCommand.class)
                    )
            )
            @org.springframework.web.bind.annotation.RequestBody VisitPartialUpdateCommand command
    ) {
        VisitResponseDto dto = visitService.updateVisitFields(visitId, command.reason(), command.notes());
        return ResponseEntity.ok(dto);
    }
}
