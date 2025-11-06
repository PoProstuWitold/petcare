package pl.witold.petcare.vet.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pl.witold.petcare.dto.VetTimeOffDto;
import pl.witold.petcare.vet.VetTimeOff;
import pl.witold.petcare.vet.mapper.VetTimeOffMapper;
import pl.witold.petcare.vet.service.VetTimeOffService;
import pl.witold.petcare.vet.commands.VetTimeOffCreateCommand;

import java.util.List;
import java.util.stream.Collectors;

/**
 * REST controller exposing endpoints for managing vet time-off periods.
 */
@RestController
@RequestMapping("/api/vets")
@RequiredArgsConstructor
public class VetTimeOffController {

    private final VetTimeOffService vetTimeOffService;

    /**
     * Returns all time-off periods for the currently authenticated vet.
     */
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
    @PostMapping("/me/time-off")
    public ResponseEntity<VetTimeOffDto> createMyTimeOff(
            @Valid @RequestBody VetTimeOffCreateCommand command
    ) {
        VetTimeOff created = vetTimeOffService.createTimeOffForCurrentVet(command);
        return ResponseEntity.ok(VetTimeOffMapper.toDto(created));
    }

    /**
     * Deletes a time-off entry for the currently authenticated vet.
     */
    @DeleteMapping("/me/time-off/{id}")
    public ResponseEntity<Void> deleteMyTimeOff(@PathVariable Long id) {
        vetTimeOffService.deleteTimeOffForCurrentVet(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Returns time-off periods for a specific vet profile.
     * This can be used by clients or booking UI to show unavailable dates.
     */
    @GetMapping("/{vetProfileId}/time-off")
    public ResponseEntity<List<VetTimeOffDto>> getVetTimeOff(@PathVariable Long vetProfileId) {
        List<VetTimeOffDto> result = vetTimeOffService.getTimeOffForVetProfile(vetProfileId).stream()
                .map(VetTimeOffMapper::toDto)
                .collect(Collectors.toList());

        return ResponseEntity.ok(result);
    }
}
