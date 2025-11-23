package pl.witold.petcare.visit;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import pl.witold.petcare.dto.VisitResponseDto;
import pl.witold.petcare.visit.commands.VisitCreateCommand;

import java.time.LocalDate;
import java.util.List;

/**
 * Service for managing pet visits.
 */
public interface VisitService {

    Visit createVisit(VisitCreateCommand command);

    List<Visit> getVisitsForPet(Long petId);

    Page<Visit> getVisitsForPet(Long petId, Pageable pageable);

    List<Visit> getVisitsForVetAndDate(Long vetProfileId, LocalDate date);

    Page<Visit> getVisitsForVetAndDate(Long vetProfileId, LocalDate date, Pageable pageable);

    /**
     * Returns all visits for currently authenticated vet.
     */
    List<Visit> getVisitsForCurrentVet();

    Page<Visit> getVisitsForCurrentVet(Pageable pageable);

    VisitResponseDto updateVisitStatus(Long visitId, VisitStatus status);

    Visit getById(Long visitId);

    void deleteById(Long visitId);

    VisitResponseDto updateVisitFields(Long visitId, String reason, String notes);
}
