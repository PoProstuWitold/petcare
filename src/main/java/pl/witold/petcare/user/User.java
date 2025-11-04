package pl.witold.petcare.user;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.Set;

@Getter
@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Full name of the person (first name, optional middle name, surname) in a single field.
     */
    @Setter
    @Column(nullable = false, length = 128)
    private String fullName;

    @Setter
    @Column(nullable = false, length = 64, unique = true)
    private String username;

    @Setter
    @Column(nullable = false, unique = true)
    private String email;

    @Setter
    @Column(nullable = false, length = 60)
    private String passwordHash;

    @Setter
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(
            joinColumns = @JoinColumn(
                    foreignKey = @ForeignKey(name = "fk_user_roles_user")
            )
    )
    @Column(nullable = false, length = 32)
    @Enumerated(EnumType.STRING)
    private Set<Role> roles;

    protected User() {
        // for JPA
    }

    public User(String fullName, String username, String email, String passwordHash, Set<Role> roles) {
        this.fullName = fullName;
        this.username = username;
        this.email = email;
        this.passwordHash = passwordHash;
        this.roles = roles;
    }

}
