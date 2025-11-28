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
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pl.witold.petcare.dto.VetProfileResponseDto;
import pl.witold.petcare.dto.VetScheduleEntryDto;
import pl.witold.petcare.vet.VetProfile;
import pl.witold.petcare.vet.commands.VetProfileUpdateCommand;
import pl.witold.petcare.vet.commands.VetScheduleEntryCommand;
import pl.witold.petcare.vet.mapper.VetProfileMapper;
import pl.witold.petcare.vet.mapper.VetScheduleMapper;
import pl.witold.petcare.vet.service.VetProfileService;
import pl.witold.petcare.vet.service.VetScheduleService;

import java.util.List;
import java.util.stream.Collectors;

/**
 * REST controller exposing endpoints for vet profiles and schedules.
 */
@Tag(
        name = "Vets",
        description = "Vet profiles, schedules and time-off management"
)
@RestController
@RequestMapping("/api/vets")
@RequiredArgsConstructor
public class VetController {

    private final VetProfileService vetProfileService;
    private final VetScheduleService vetScheduleService;

    /**
     * Returns all vet profiles.
     */
    @Operation(
            summary = "Get all vets",
            description = "Returns a paginated list of all vet profiles available in the system. " +
                    "Supports pagination with parameters: page (default: 0), size (default: 20, max: 100), sort (e.g., id,asc)."
    )
    @ApiResponse(
            responseCode = "200",
            description = "Paginated list of vet profiles returned successfully",
            content = @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = Page.class)
            )
    )
    @GetMapping
    public ResponseEntity<Page<VetProfileResponseDto>> getAllVets(
            @PageableDefault(size = 20) Pageable pageable
    ) {
        Page<VetProfile> profiles = vetProfileService.getAllProfiles(pageable);
        Page<VetProfileResponseDto> result = profiles.map(VetProfileMapper::toDto);
        return ResponseEntity.ok(result);
    }

    /**
     * Returns a vet profile by its id.
     */
    @Operation(
            summary = "Get vet profile by id",
            description = "Returns a vet profile by its id."
    )
    @ApiResponse(
            responseCode = "200",
            description = "Vet profile returned successfully",
            content = @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = VetProfileResponseDto.class)
            )
    )
    @ApiResponse(
            responseCode = "404",
            description = "Vet profile not found"
    )
    @GetMapping("/{id}")
    public ResponseEntity<VetProfileResponseDto> getVetById(
            @Parameter(description = "Vet profile id", example = "1")
            @PathVariable Long id
    ) {
        VetProfile profile = vetProfileService.getById(id);
        return ResponseEntity.ok(VetProfileMapper.toDto(profile));
    }

    /**
     * Returns vet profile for the currently authenticated vet.
     * If the profile does not exist, it is created with default values.
     */
    @Operation(
            summary = "Get current vet profile",
            description = "Returns vet profile for the currently authenticated vet. "
                    + "If it does not exist, it will be created with default values."
    )
    @ApiResponse(
            responseCode = "200",
            description = "Current vet profile returned successfully",
            content = @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = VetProfileResponseDto.class)
            )
    )
    @GetMapping("/me/profile")
    public ResponseEntity<VetProfileResponseDto> getMyProfile() {
        VetProfile profile = vetProfileService.getOrCreateCurrentVetProfile();
        return ResponseEntity.ok(VetProfileMapper.toDto(profile));
    }

    /**
     * Updates vet profile for the currently authenticated vet.
     */
    @Operation(
            summary = "Update current vet profile",
            description = "Updates vet profile for the currently authenticated vet."
    )
    @ApiResponse(
            responseCode = "200",
            description = "Current vet profile updated successfully",
            content = @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = VetProfileResponseDto.class)
            )
    )
    @PutMapping("/me/profile")
    public ResponseEntity<VetProfileResponseDto> updateMyProfile(
            @Valid
            @RequestBody(
                    description = "Payload with vet profile data to be updated",
                    required = true,
                    content = @Content(
                            schema = @Schema(implementation = VetProfileUpdateCommand.class)
                    )
            )
            @org.springframework.web.bind.annotation.RequestBody VetProfileUpdateCommand command
    ) {
        VetProfile profile = vetProfileService.updateCurrentVetProfile(command);
        return ResponseEntity.ok(VetProfileMapper.toDto(profile));
    }

    /**
     * Returns schedule for the currently authenticated vet.
     */
    @Operation(
            summary = "Get schedule for current vet",
            description = "Returns schedule entries for the currently authenticated vet."
    )
    @ApiResponse(
            responseCode = "200",
            description = "Schedule for current vet returned successfully",
            content = @Content(
                    mediaType = "application/json",
                    array = @ArraySchema(schema = @Schema(implementation = VetScheduleEntryDto.class))
            )
    )
    @GetMapping("/me/schedule")
    public ResponseEntity<List<VetScheduleEntryDto>> getMySchedule() {
        List<VetScheduleEntryDto> result = vetScheduleService.getScheduleForCurrentVet().stream()
                .map(VetScheduleMapper::toDto)
                .collect(Collectors.toList());

        return ResponseEntity.ok(result);
    }

    /**
     * Replaces schedule for the currently authenticated vet.
     */
    @Operation(
            summary = "Update schedule for current vet",
            description = "Replaces the schedule for the currently authenticated vet with provided entries."
    )
    @ApiResponse(
            responseCode = "200",
            description = "Schedule for current vet updated successfully",
            content = @Content(
                    mediaType = "application/json",
                    array = @ArraySchema(schema = @Schema(implementation = VetScheduleEntryDto.class))
            )
    )
    @PutMapping("/me/schedule")
    public ResponseEntity<List<VetScheduleEntryDto>> updateMySchedule(
            @Valid
            @RequestBody(
                    description = "List of schedule entries which will replace existing schedule",
                    required = true,
                    content = @Content(
                            array = @ArraySchema(schema = @Schema(implementation = VetScheduleEntryCommand.class))
                    )
            )
            @org.springframework.web.bind.annotation.RequestBody List<VetScheduleEntryCommand> commands
    ) {
        List<VetScheduleEntryDto> result = vetScheduleService.updateScheduleForCurrentVet(commands).stream()
                .map(VetScheduleMapper::toDto)
                .collect(Collectors.toList());

        return ResponseEntity.ok(result);
    }

    /**
     * Returns schedule for the given vet profile id.
     */
    @Operation(
            summary = "Get schedule for vet profile",
            description = "Returns schedule for a given vet profile id. "
                    + "Useful for booking UI to show available slots."
    )
    @ApiResponse(
            responseCode = "200",
            description = "Schedule for vet profile returned successfully",
            content = @Content(
                    mediaType = "application/json",
                    array = @ArraySchema(schema = @Schema(implementation = VetScheduleEntryDto.class))
            )
    )
    @GetMapping("/{id}/schedule")
    public ResponseEntity<List<VetScheduleEntryDto>> getVetSchedule(
            @Parameter(description = "Vet profile id", example = "1")
            @PathVariable Long id
    ) {
        List<VetScheduleEntryDto> result = vetScheduleService.getScheduleForVetProfile(id).stream()
                .map(VetScheduleMapper::toDto)
                .collect(Collectors.toList());

        return ResponseEntity.ok(result);
    }
}
