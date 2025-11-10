package pl.witold.petcare.medicalrecord;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import pl.witold.petcare.pet.Pet;
import pl.witold.petcare.vet.VetProfile;
import pl.witold.petcare.visit.Visit;

import java.time.LocalDateTime;

@Getter
@Entity
@Table(
        name = "medical_records",
        indexes = {
                @Index(name = "idx_medical_records_pet_id", columnList = "pet_id"),
                @Index(name = "idx_medical_records_vet_profile_id", columnList = "vet_profile_id")
        },
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_medical_records_visit_id", columnNames = {"visit_id"})
        }
)
public class MedicalRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.EAGER)
    @JoinColumn(name = "pet_id", nullable = false)
    private Pet pet;

    @ManyToOne(optional = false, fetch = FetchType.EAGER)
    @JoinColumn(name = "vet_profile_id", nullable = false)
    private VetProfile vetProfile;

    @OneToOne(optional = false, fetch = FetchType.EAGER)
    @JoinColumn(name = "visit_id", nullable = false)
    private Visit visit;

    @Setter
    @Column(name = "title", length = 128)
    private String title;

    @Setter
    @Column(name = "diagnosis", length = 1024)
    private String diagnosis;

    @Setter
    @Column(name = "treatment", length = 1024)
    private String treatment;

    @Setter
    @Column(name = "prescriptions", length = 1024)
    private String prescriptions;

    @Setter
    @Column(name = "notes", length = 2048)
    private String notes;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    protected MedicalRecord() {
        // JPA
    }

    public MedicalRecord(Pet pet,
                         VetProfile vetProfile,
                         Visit visit,
                         String title,
                         String diagnosis,
                         String treatment,
                         String prescriptions,
                         String notes) {
        this.pet = pet;
        this.vetProfile = vetProfile;
        this.visit = visit;
        this.title = title;
        this.diagnosis = diagnosis;
        this.treatment = treatment;
        this.prescriptions = prescriptions;
        this.notes = notes;
        this.createdAt = LocalDateTime.now();
    }
}

