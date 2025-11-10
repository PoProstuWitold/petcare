package pl.witold.petcare.vet;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import pl.witold.petcare.user.User;

import java.util.HashSet;
import java.util.Set;

/**
 * Entity representing a veterinarian profile with professional details.
 */
@Getter
@Entity
@Table(name = "vet_profiles")
public class VetProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Setter
    @OneToOne(optional = false, fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", unique = true, nullable = false)
    private User user;

    @Setter
    @Column()
    private String bio;

    @Setter
    @Column(name = "accepts_new_patients", nullable = false)
    private boolean acceptsNewPatients = true;

    @Setter
    @Column(name = "average_visit_length_minutes", nullable = false)
    private Integer averageVisitLengthMinutes = 20;

    @Setter
    @ElementCollection(targetClass = VetSpecialization.class, fetch = FetchType.EAGER)
    @CollectionTable(
            name = "vet_profile_specializations",
            joinColumns = @JoinColumn(name = "vet_profile_id")
    )
    @Enumerated(EnumType.STRING)
    @Column(name = "specialization", length = 64, nullable = false)
    private Set<VetSpecialization> specializations = new HashSet<>();

    protected VetProfile() {
        // for JPA
    }

    public VetProfile(User user) {
        this.user = user;
    }
}
