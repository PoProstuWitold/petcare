package pl.witold.petcare.medicalrecord;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.ArraySchema;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.parameters.RequestBody;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
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
@Tag(name = "Medical Records", description = "Create, list, update and delete medical records")
public class MedicalRecordController {

    private final MedicalRecordService medicalRecordService;

    @Operation(
            summary = "Create a new medical record",
            description = "Creates a new medical record for a given visit. Allowed for the visit's veterinarian or ADMIN. Visit must be CONFIRMED or COMPLETED."
    )
    @ApiResponse(
            responseCode = "201",
            description = "Medical record created",
            content = @Content(mediaType = "application/json", schema = @Schema(implementation = MedicalRecordResponseDto.class))
    )
    @ApiResponse(responseCode = "400", description = "Validation error in request body")
    @ApiResponse(responseCode = "404", description = "Visit not found")
    @ApiResponse(responseCode = "409", description = "Medical record for this visit already exists")
    @ApiResponse(responseCode = "422", description = "Business rule violation (e.g. visit not confirmed/completed or not your visit)")
    @PostMapping
    public ResponseEntity<MedicalRecordResponseDto> create(
            @Valid
            @RequestBody(
                    description = "Payload to create a medical record",
                    required = true,
                    content = @Content(schema = @Schema(implementation = MedicalRecordCreateCommand.class))
            )
            @org.springframework.web.bind.annotation.RequestBody MedicalRecordCreateCommand command
    ) {
        MedicalRecordResponseDto created = medicalRecordService.create(command);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @Operation(
            summary = "Get medical records for a pet",
            description = "Returns medical records for the given pet id, newest first. Access is checked against pet visibility."
    )
    @ApiResponse(
            responseCode = "200",
            description = "List of medical records for the pet",
            content = @Content(mediaType = "application/json", array = @ArraySchema(schema = @Schema(implementation = MedicalRecordResponseDto.class)))
    )
    @ApiResponse(responseCode = "404", description = "Pet not found")
    @GetMapping("/by-pet/{petId}")
    public ResponseEntity<List<MedicalRecordResponseDto>> getForPet(@PathVariable Long petId) {
        List<MedicalRecordResponseDto> list = medicalRecordService.getForPet(petId);
        return ResponseEntity.ok(list);
    }

    @Operation(
            summary = "Get medical records for current vet",
            description = "Returns medical records authored by the currently authenticated vet, newest first."
    )
    @ApiResponse(
            responseCode = "200",
            description = "List of medical records for current vet",
            content = @Content(mediaType = "application/json", array = @ArraySchema(schema = @Schema(implementation = MedicalRecordResponseDto.class)))
    )
    @GetMapping("/me")
    public ResponseEntity<List<MedicalRecordResponseDto>> getForCurrentVet() {
        List<MedicalRecordResponseDto> list = medicalRecordService.getForCurrentVet();
        return ResponseEntity.ok(list);
    }

    @Operation(
            summary = "Get medical record by visit id",
            description = "Returns a medical record if it exists for the given visit id."
    )
    @ApiResponse(
            responseCode = "200",
            description = "Medical record found",
            content = @Content(mediaType = "application/json", schema = @Schema(implementation = MedicalRecordResponseDto.class))
    )
    @ApiResponse(responseCode = "404", description = "Medical record not found for the visit")
    @GetMapping("/by-visit/{visitId}")
    public ResponseEntity<MedicalRecordResponseDto> getByVisit(@PathVariable Long visitId) {
        Optional<MedicalRecordResponseDto> opt = medicalRecordService.getByVisitId(visitId);
        return opt.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @Operation(
        summary = "Update medical record",
        description = "Partially updates editable fields (title, diagnosis, treatment, prescriptions, notes). Allowed for the authoring vet or ADMIN."
    )
    @ApiResponse(
            responseCode = "200",
            description = "Medical record updated",
            content = @Content(mediaType = "application/json", schema = @Schema(implementation = MedicalRecordResponseDto.class))
    )
    @ApiResponse(responseCode = "404", description = "Medical record not found")
    @ApiResponse(responseCode = "422", description = "Business rule violation (not your record)")
    @PatchMapping("/{id}")
    public ResponseEntity<MedicalRecordResponseDto> update(
            @PathVariable Long id,
            @Valid @org.springframework.web.bind.annotation.RequestBody MedicalRecordUpdateCommand command
    ) {
        MedicalRecordResponseDto updated = medicalRecordService.update(id, command);
        return ResponseEntity.ok(updated);
    }

    @Operation(
            summary = "Delete medical record",
            description = "Deletes a medical record. Allowed for the authoring vet or ADMIN."
    )
    @ApiResponse(responseCode = "204", description = "Medical record deleted")
    @ApiResponse(responseCode = "404", description = "Medical record not found")
    @ApiResponse(responseCode = "422", description = "Business rule violation (not your record)")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        medicalRecordService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @Operation(
            summary = "List all medical records",
            description = "Returns all medical records ordered by creation date (newest first). Intended for admin or vet dashboards."
    )
    @ApiResponse(
            responseCode = "200",
            description = "List of all medical records",
            content = @Content(mediaType = "application/json", array = @ArraySchema(schema = @Schema(implementation = MedicalRecordResponseDto.class)))
    )
    @GetMapping
    public ResponseEntity<List<MedicalRecordResponseDto>> getAll() {
        List<MedicalRecordResponseDto> list = medicalRecordService.getAll();
        return ResponseEntity.ok(list);
    }
}
