package pl.witold.petcare.visit;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pl.witold.petcare.dto.VisitResponseDto;
import pl.witold.petcare.visit.commands.VisitCreateCommand;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

/**
 * REST controller exposing endpoints for booking and listing visits.
 */
@RestController
@RequestMapping("/api/visits")
@RequiredArgsConstructor
public class VisitController {

    private final VisitService visitService;

    /**
     * POST /api/visits
     * Creates a new visit.
     */
    @PostMapping()
    public ResponseEntity<VisitResponseDto> createVisit(
            @Valid @RequestBody VisitCreateCommand command
    ) {
        Visit created = visitService.createVisit(command);
        return ResponseEntity.status(HttpStatus.CREATED).body(VisitMapper.toDto(created));
    }

    /**
     * GET /api/visits/by-pet/{petId}
     * Returns all visits for the given pet.
     */
    @GetMapping("/by-pet/{petId}")
    public ResponseEntity<List<VisitResponseDto>> getVisitsForPet(@PathVariable Long petId) {
        List<VisitResponseDto> result = visitService.getVisitsForPet(petId).stream()
                .map(VisitMapper::toDto)
                .collect(Collectors.toList());

        return ResponseEntity.ok(result);
    }

    /**
     * GET /api/visits/by-vet/{vetProfileId}?date=YYYY-MM-DD
     * Returns all visits for a given vet profile on a specific date.
     * Used by booking UI to block already taken slots.
     */
    @GetMapping("/by-vet/{vetProfileId}")
    public ResponseEntity<List<VisitResponseDto>> getVisitsForVetAndDate(
            @PathVariable Long vetProfileId,
            @RequestParam("date") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date
    ) {
        List<VisitResponseDto> result =
                visitService.getVisitsForVetAndDate(vetProfileId, date).stream()
                        .map(VisitMapper::toDto)
                        .collect(Collectors.toList());

        return ResponseEntity.ok(result);
    }
}
