package pl.witold.petcare.visit.commands;

import jakarta.validation.constraints.NotNull;
import pl.witold.petcare.visit.VisitStatus;

public record VisitStatusUpdateCommand(
        @NotNull(message = "Status must be provided")
        VisitStatus status
) {}
