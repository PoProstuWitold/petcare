package pl.witold.petcare.visit;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import pl.witold.petcare.pet.Pet;
import pl.witold.petcare.vet.VetProfile;

import java.time.LocalDate;
import java.time.LocalTime;

/**
 * Entity representing a single booked visit for a pet and vet.
 */
@Getter
@Entity
@Table(
        name = "visits",
        indexes = {
                @Index(name = "idx_visits_pet_id", columnList = "pet_id"),
                @Index(name = "idx_visits_vet_profile_and_date", columnList = "vet_profile_id, visit_date")
        }
)
public class Visit {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.EAGER)
    @JoinColumn(name = "pet_id", nullable = false)
    private Pet pet;

    @ManyToOne(optional = false, fetch = FetchType.EAGER)
    @JoinColumn(name = "vet_profile_id", nullable = false)
    private VetProfile vetProfile;

    @Column(name = "visit_date", nullable = false)
    private LocalDate date;

    @Column(name = "start_time", nullable = false)
    private LocalTime startTime;

    @Column(name = "end_time", nullable = false)
    private LocalTime endTime;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 32, nullable = false)
    @Setter
    private VisitStatus status = VisitStatus.SCHEDULED;

    @Setter
    @Column(name = "reason", length = 255)
    private String reason;

    @Setter
    @Column(name = "notes", length = 1024)
    private String notes;

    protected Visit() {
        // for JPA
    }

    public Visit(
            Pet pet,
            VetProfile vetProfile,
            LocalDate date,
            LocalTime startTime,
            LocalTime endTime,
            String reason,
            String notes
    ) {
        this.pet = pet;
        this.vetProfile = vetProfile;
        this.date = date;
        this.startTime = startTime;
        this.endTime = endTime;
        this.status = VisitStatus.SCHEDULED;
        this.reason = reason;
        this.notes = notes;
    }
}
