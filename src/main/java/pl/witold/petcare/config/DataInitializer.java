package pl.witold.petcare.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import pl.witold.petcare.pet.Pet;
import pl.witold.petcare.pet.PetRepository;
import pl.witold.petcare.user.Role;
import pl.witold.petcare.user.User;
import pl.witold.petcare.user.UserRepository;

import java.time.LocalDate;
import java.util.Optional;
import java.util.Set;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final PetRepository petRepository;

    public DataInitializer(UserRepository userRepository,
                           PasswordEncoder passwordEncoder,
                           PetRepository petRepository) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.petRepository = petRepository;
    }

    @Override
    @Transactional
    public void run(String... args) {
        User admin = createUserIfNotExists(
                "admin",
                "admin@petcare.local",
                "System Administrator",
                "admin123",
                Role.ADMIN
        );

        User vet = createUserIfNotExists(
                "vet",
                "vet@petcare.local",
                "Default Veterinarian",
                "vet123",
                Role.VET
        );

        User witq = createUserIfNotExists(
                "witq",
                "witq@petcare.local",
                "Example User",
                "witq123",
                Role.USER
        );

        seedPetsIfEmpty(admin, vet, witq);
    }

    private User createUserIfNotExists(String username,
                                       String email,
                                       String fullName,
                                       String rawPassword,
                                       Role role) {

        Optional<User> existing = userRepository.findByUsername(username);
        if (existing.isPresent()) {
            log.info("User '{}' already exists. Skipping seeding.", username);
            return existing.get();
        }

        boolean emailTaken = userRepository.existsByEmail(email);
        if (emailTaken) {
            log.info("Email '{}' already used. Skipping user '{}' seeding.", email, username);
            // próbujemy jednak go znaleźć po emailu, żeby mieć referencję
            return userRepository.findByEmail(email).orElse(null);
        }

        String hash = passwordEncoder.encode(rawPassword);

        User user = new User(
                fullName,
                username,
                email,
                hash,
                Set.of(role)
        );

        userRepository.save(user);
        log.info("Created {} user with username='{}' and password='{}'",
                role, username, rawPassword);
        return user;
    }

    private void seedPetsIfEmpty(User admin, User vet, User witq) {
        if (petRepository.count() > 0) {
            log.info("Pets already exist. Skipping pet seeding.");
            return;
        }

        log.info("Seeding example pets...");

        if (witq != null) {
            petRepository.save(new Pet(
                    witq,
                    "Burek",
                    "DOG",
                    "Crossbreed",
                    LocalDate.of(2018, 5, 10),
                    "Allergic to chicken."
            ));

            petRepository.save(new Pet(
                    witq,
                    "Filemon",
                    "CAT",
                    "European Shorthair",
                    LocalDate.of(2021, 3, 2),
                    "Indoor cat, slightly overweight."
            ));
        }

        if (vet != null) {
            petRepository.save(new Pet(
                    vet,
                    "Luna",
                    "DOG",
                    "Border Collie",
                    LocalDate.of(2020, 9, 15),
                    "Belongs to the vet. Very energetic."
            ));
        }

        if (admin != null) {
            petRepository.save(new Pet(
                    admin,
                    "Rex",
                    "DOG",
                    "German Shepherd",
                    LocalDate.of(2017, 1, 20),
                    "Guard dog of the clinic owner."
            ));
        }
    }
}
