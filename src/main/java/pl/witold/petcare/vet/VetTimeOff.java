package pl.witold.petcare.vet;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

/**
 * Entity representing a period when a vet is not available
 * (vacation, sick leave, conference, etc.).
 */
@Getter
@Entity
@Table(name = "vet_time_off")
public class VetTimeOff {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Setter
    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "vet_profile_id", nullable = false)
    private VetProfile vetProfile;

    @Setter
    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Setter
    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;

    @Setter
    @Column()
    private String reason;

    public VetTimeOff() {
        // for JPA
    }
}
