package pl.witold.petcare.visit.commands;

import jakarta.annotation.Nullable;
import jakarta.validation.constraints.Size;

/**
 * Partial update command for visit editable fields.
 */
public record VisitPartialUpdateCommand(
        @Nullable @Size(max = 255) String reason,
        @Nullable @Size(max = 1024) String notes
) {
}
