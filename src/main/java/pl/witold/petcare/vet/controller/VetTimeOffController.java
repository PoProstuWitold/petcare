package pl.witold.petcare.vet.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.ArraySchema;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.parameters.RequestBody;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pl.witold.petcare.dto.VetTimeOffDto;
import pl.witold.petcare.vet.VetTimeOff;
import pl.witold.petcare.vet.commands.VetTimeOffCreateCommand;
import pl.witold.petcare.vet.mapper.VetTimeOffMapper;
import pl.witold.petcare.vet.service.VetTimeOffService;

import java.util.List;
import java.util.stream.Collectors;

/**
 * REST controller exposing endpoints for managing vet time-off periods.
 */
@Tag(
        name = "Vets",
        description = "Vet profiles, schedules and time-off management"
)
@RestController
@RequestMapping("${api.prefix:/api}/vets")
@RequiredArgsConstructor
public class VetTimeOffController {

    private final VetTimeOffService vetTimeOffService;

    /**
     * Returns all time-off periods for the currently authenticated vet.
     */
    @Operation(
            summary = "Get time-off periods for current vet",
            description = "Returns all time-off periods for the currently authenticated vet."
    )
    @ApiResponse(
            responseCode = "200",
            description = "List of time-off periods for current vet returned successfully",
            content = @Content(
                    mediaType = "application/json",
                    array = @ArraySchema(schema = @Schema(implementation = VetTimeOffDto.class))
            )
    )
    @GetMapping("/me/time-off")
    public ResponseEntity<List<VetTimeOffDto>> getMyTimeOff() {
        List<VetTimeOffDto> result = vetTimeOffService.getTimeOffForCurrentVet().stream()
                .map(VetTimeOffMapper::toDto)
                .collect(Collectors.toList());

        return ResponseEntity.ok(result);
    }

    /**
     * Creates a new time-off period for the currently authenticated vet.
     */
    @Operation(
            summary = "Create time-off period for current vet",
            description = "Creates a new time-off period for the currently authenticated vet."
    )
    @ApiResponse(
            responseCode = "200",
            description = "Time-off period created successfully",
            content = @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = VetTimeOffDto.class)
            )
    )
    @ApiResponse(
            responseCode = "400",
            description = "Validation error in time-off payload"
    )
    @PostMapping("/me/time-off")
    public ResponseEntity<VetTimeOffDto> createMyTimeOff(
            @Valid
            @RequestBody(
                    description = "Payload with time-off period data",
                    required = true,
                    content = @Content(
                            schema = @Schema(implementation = VetTimeOffCreateCommand.class)
                    )
            )
            @org.springframework.web.bind.annotation.RequestBody VetTimeOffCreateCommand command
    ) {
        VetTimeOff created = vetTimeOffService.createTimeOffForCurrentVet(command);
        return ResponseEntity.ok(VetTimeOffMapper.toDto(created));
    }

    /**
     * Deletes a time-off entry for the currently authenticated vet.
     */
    @Operation(
            summary = "Delete time-off period for current vet",
            description = "Deletes a time-off entry for the currently authenticated vet."
    )
    @ApiResponse(
            responseCode = "204",
            description = "Time-off period deleted successfully"
    )
    @ApiResponse(
            responseCode = "404",
            description = "Time-off period not found"
    )
    @DeleteMapping("/me/time-off/{id}")
    public ResponseEntity<Void> deleteMyTimeOff(
            @Parameter(description = "Time-off id", example = "1")
            @PathVariable Long id
    ) {
        vetTimeOffService.deleteTimeOffForCurrentVet(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Returns time-off periods for a specific vet profile.
     * This can be used by clients or booking UI to show unavailable dates.
     */
    @Operation(
            summary = "Get time-off periods for vet profile",
            description = "Returns time-off periods for a specific vet profile. "
                    + "Can be used by booking UI to show unavailable dates."
    )
    @ApiResponse(
            responseCode = "200",
            description = "List of time-off periods for vet profile returned successfully",
            content = @Content(
                    mediaType = "application/json",
                    array = @ArraySchema(schema = @Schema(implementation = VetTimeOffDto.class))
            )
    )
    @GetMapping("/{vetProfileId}/time-off")
    public ResponseEntity<List<VetTimeOffDto>> getVetTimeOff(
            @Parameter(description = "Vet profile id", example = "1")
            @PathVariable Long vetProfileId
    ) {
        List<VetTimeOffDto> result = vetTimeOffService.getTimeOffForVetProfile(vetProfileId).stream()
                .map(VetTimeOffMapper::toDto)
                .collect(Collectors.toList());

        return ResponseEntity.ok(result);
    }
}
