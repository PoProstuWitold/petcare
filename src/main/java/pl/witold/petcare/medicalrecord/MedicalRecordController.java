package pl.witold.petcare.medicalrecord;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pl.witold.petcare.dto.MedicalRecordResponseDto;
import pl.witold.petcare.medicalrecord.commands.MedicalRecordCreateCommand;
import pl.witold.petcare.medicalrecord.commands.MedicalRecordUpdateCommand;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/medical-records")
@RequiredArgsConstructor
public class MedicalRecordController {

    private final MedicalRecordService medicalRecordService;

    @PostMapping
    public ResponseEntity<MedicalRecordResponseDto> create(@Valid @RequestBody MedicalRecordCreateCommand command) {
        MedicalRecordResponseDto created = medicalRecordService.create(command);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping("/by-pet/{petId}")
    public ResponseEntity<List<MedicalRecordResponseDto>> getForPet(@PathVariable Long petId) {
        List<MedicalRecordResponseDto> list = medicalRecordService.getForPet(petId);
        return ResponseEntity.ok(list);
    }

    @GetMapping("/me")
    public ResponseEntity<List<MedicalRecordResponseDto>> getForCurrentVet() {
        List<MedicalRecordResponseDto> list = medicalRecordService.getForCurrentVet();
        return ResponseEntity.ok(list);
    }

    @GetMapping("/by-visit/{visitId}")
    public ResponseEntity<MedicalRecordResponseDto> getByVisit(@PathVariable Long visitId) {
        Optional<MedicalRecordResponseDto> opt = medicalRecordService.getByVisitId(visitId);
        return opt.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PatchMapping("/{id}")
    public ResponseEntity<MedicalRecordResponseDto> update(
            @PathVariable Long id,
            @Valid @RequestBody MedicalRecordUpdateCommand command
    ) {
        MedicalRecordResponseDto updated = medicalRecordService.update(id, command);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        medicalRecordService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping
    public ResponseEntity<List<MedicalRecordResponseDto>> getAll() {
        List<MedicalRecordResponseDto> list = medicalRecordService.getAll();
        return ResponseEntity.ok(list);
    }
}
