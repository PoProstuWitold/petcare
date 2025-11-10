package pl.witold.petcare.medicalrecord;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pl.witold.petcare.dto.MedicalRecordResponseDto;
import pl.witold.petcare.medicalrecord.commands.MedicalRecordCreateCommand;

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
}
