package pl.witold.petcare.dto;

import java.time.LocalDateTime;

public record MedicalRecordResponseDto(
        Long id,
        PetResponseDto pet,
        VetProfileResponseDto vetProfile,
        VisitResponseDto visit,
        String title,
        String diagnosis,
        String treatment,
        String prescriptions,
        String notes,
        LocalDateTime createdAt
) {}
