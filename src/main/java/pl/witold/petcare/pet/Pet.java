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

    // For now regular string, later can be changed to enum or separate entity
    @Setter
    @Column(nullable = false, length = 32)
    private String species;

    @Setter
    @Column(length = 64)
    private String breed;

    @Setter
    @Column()
    private LocalDate dateOfBirth;

    @Setter
    @Column(length = 512)
    private String notes;

    protected Pet() {
        // JPA
    }

    public Pet(User owner,
               String name,
               String species,
               String breed,
               LocalDate dateOfBirth,
               String notes) {
        this.owner = owner;
        this.name = name;
        this.species = species;
        this.breed = breed;
        this.dateOfBirth = dateOfBirth;
        this.notes = notes;
    }

}
