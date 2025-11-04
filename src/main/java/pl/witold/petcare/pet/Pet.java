package pl.witold.petcare.pet;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import pl.witold.petcare.user.User;

import java.time.LocalDate;

@Getter
@Entity
@Table(name = "pets")
public class Pet {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Setter
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            nullable = false,
            foreignKey = @ForeignKey(name = "fk_pets_owner")
    )
    private User owner;

    @Setter
    @Column(nullable = false, length = 64)
    private String name;

    @Setter
    @Enumerated(EnumType.STRING) // store enum name as string
    @Column(nullable = false, length = 32)
    private Species species;

    @Setter
    @Enumerated(EnumType.STRING)
    @Column(length = 16)
    private Sex sex;

    @Setter
    @Column(length = 64)
    private String breed;

    @Setter
    @Column()
    private Integer birthYear;

    @Setter
    @Column()
    private LocalDate birthDate;

    // NEW: weight in kilograms
    @Setter
    @Column()
    private Double weight;

    @Setter
    @Column(length = 512)
    private String notes;

    protected Pet() {
        // JPA
    }

    public Pet(User owner,
               String name,
               Species species,
               Sex sex,
               String breed,
               LocalDate birthDate,
               Integer birthYear,
               Double weight,
               String notes) {
        this.owner = owner;
        this.name = name;
        this.species = species;
        this.sex = sex;
        this.breed = breed;
        this.birthDate = birthDate;
        this.birthYear = birthYear;
        this.weight = weight;
        this.notes = notes;
    }
}
