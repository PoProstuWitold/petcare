package pl.witold.petcare.vet.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pl.witold.petcare.dto.VetProfileResponseDto;
import pl.witold.petcare.dto.VetScheduleEntryDto;
import pl.witold.petcare.vet.*;
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
@RestController
@RequestMapping("/api/vets")
@RequiredArgsConstructor
public class VetController {

    private final VetProfileService vetProfileService;
    private final VetScheduleService vetScheduleService;

    /**
     * Returns all vet profiles.
     */
    @GetMapping
    public ResponseEntity<List<VetProfileResponseDto>> getAllVets() {
        List<VetProfileResponseDto> result = vetProfileService.getAllProfiles().stream()
                .map(VetProfileMapper::toDto)
                .collect(Collectors.toList());

        return ResponseEntity.ok(result);
    }

    /**
     * Returns a vet profile by its id.
     */
    @GetMapping("/{id}")
    public ResponseEntity<VetProfileResponseDto> getVetById(@PathVariable Long id) {
        VetProfile profile = vetProfileService.getById(id);
        return ResponseEntity.ok(VetProfileMapper.toDto(profile));
    }

    /**
     * Returns vet profile for the currently authenticated vet.
     * If the profile does not exist, it is created with default values.
     */
    @GetMapping("/me/profile")
    public ResponseEntity<VetProfileResponseDto> getMyProfile() {
        VetProfile profile = vetProfileService.getOrCreateCurrentVetProfile();
        return ResponseEntity.ok(VetProfileMapper.toDto(profile));
    }

    /**
     * Updates vet profile for the currently authenticated vet.
     */
    @PutMapping("/me/profile")
    public ResponseEntity<VetProfileResponseDto> updateMyProfile(
            @Valid @RequestBody VetProfileUpdateCommand command
    ) {
        VetProfile profile = vetProfileService.updateCurrentVetProfile(command);
        return ResponseEntity.ok(VetProfileMapper.toDto(profile));
    }

    /**
     * Returns schedule for the currently authenticated vet.
     */
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
    @PutMapping("/me/schedule")
    public ResponseEntity<List<VetScheduleEntryDto>> updateMySchedule(
            @Valid @RequestBody List<VetScheduleEntryCommand> commands
    ) {
        List<VetScheduleEntryDto> result = vetScheduleService.updateScheduleForCurrentVet(commands).stream()
                .map(VetScheduleMapper::toDto)
                .collect(Collectors.toList());

        return ResponseEntity.ok(result);
    }

    /**
     * Returns schedule for the given vet profile id.
     */
    @GetMapping("/{id}/schedule")
    public ResponseEntity<List<VetScheduleEntryDto>> getVetSchedule(@PathVariable Long id) {
        List<VetScheduleEntryDto> result = vetScheduleService.getScheduleForVetProfile(id).stream()
                .map(VetScheduleMapper::toDto)
                .collect(Collectors.toList());

        return ResponseEntity.ok(result);
    }
}
