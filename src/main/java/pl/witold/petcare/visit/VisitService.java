package pl.witold.petcare.visit;

import pl.witold.petcare.visit.commands.VisitCreateCommand;

import java.time.LocalDate;
import java.util.List;

/**
 * Service for managing pet visits.
 */
public interface VisitService {

    Visit createVisit(VisitCreateCommand command);

    List<Visit> getVisitsForPet(Long petId);

    List<Visit> getVisitsForVetAndDate(Long vetProfileId, LocalDate date);
}
