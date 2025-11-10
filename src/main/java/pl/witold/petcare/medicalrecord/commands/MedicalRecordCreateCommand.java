package pl.witold.petcare.medicalrecord.commands;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record MedicalRecordCreateCommand(
        @NotNull Long visitId,
        @Size(max = 128) String title,
        @Size(max = 1024) String diagnosis,
        @Size(max = 1024) String treatment,
        @Size(max = 1024) String prescriptions,
        @Size(max = 2048) String notes
) {}

