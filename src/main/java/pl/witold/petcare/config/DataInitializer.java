package pl.witold.petcare.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import pl.witold.petcare.pet.Pet;
import pl.witold.petcare.pet.PetRepository;
import pl.witold.petcare.pet.Sex;
import pl.witold.petcare.pet.Species;
import pl.witold.petcare.user.Role;
import pl.witold.petcare.user.User;
import pl.witold.petcare.user.UserRepository;
import pl.witold.petcare.vet.VetProfile;
import pl.witold.petcare.vet.VetScheduleEntry;
import pl.witold.petcare.vet.VetSpecialization;
import pl.witold.petcare.vet.repository.VetProfileRepository;
import pl.witold.petcare.vet.repository.VetScheduleEntryRepository;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Optional;
import java.util.Set;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final PetRepository petRepository;
    private final VetProfileRepository vetProfileRepository;
    private final VetScheduleEntryRepository vetScheduleEntryRepository;

    public DataInitializer(UserRepository userRepository,
                           PasswordEncoder passwordEncoder,
                           PetRepository petRepository,
                           VetProfileRepository vetProfileRepository,
                           VetScheduleEntryRepository vetScheduleEntryRepository) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.petRepository = petRepository;
        this.vetProfileRepository = vetProfileRepository;
        this.vetScheduleEntryRepository = vetScheduleEntryRepository;
    }

    @Override
    @Transactional
    public void run(String... args) {
        User admin = createUserIfNotExists(
                "admin",
                "admin@petcare.local",
                "System Administrator",
                "admin12345678",
                Role.ADMIN
        );

        User vet = createUserIfNotExists(
                "vet",
                "vet@petcare.local",
                "System Veterinarian",
                "vet12345678",
                Role.VET
        );

        User user = createUserIfNotExists(
                "user",
                "user@petcare.local",
                "System User",
                "user12345678",
                Role.USER
        );

        seedPetsIfEmpty(admin, vet, user);
        seedVetProfileAndSchedule(vet);
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

    private void seedPetsIfEmpty(User admin, User vet, User user) {
        if (petRepository.count() > 0) {
            log.info("Pets already exist. Skipping pet seeding.");
            return;
        }

        log.info("Seeding example pets...");

        if (user != null) {
            petRepository.save(new Pet(
                    user,
                    "Sara",
                    Species.DOG,
                    Sex.FEMALE,
                    "Crossbreed",
                    LocalDate.of(2021, 5, 10),
                    2021,
                    9.5,
                    "Very friendly and loves kids."
            ));

            petRepository.save(new Pet(
                    user,
                    "Yuki",
                    Species.CAT,
                    Sex.FEMALE,
                    "European Shorthair",
                    LocalDate.of(2022, 5, 10),
                    2022,
                    3.8,
                    "Timid and afraid of vaccinations."
            ));
        }

        if (vet != null) {
            petRepository.save(new Pet(
                    vet,
                    "Abi",
                    Species.DOG,
                    Sex.FEMALE,
                    "Crossbreed",
                    LocalDate.of(2023, 5, 10),
                    2023,
                    9.0,
                    "Very shy and needs time to warm up to new people."
            ));
        }

        if (admin != null) {
            petRepository.save(new Pet(
                    admin,
                    "Harry",
                    Species.DOG,
                    Sex.MALE,
                    "Hunting Spaniel",
                    LocalDate.of(2008, 5, 10),
                    2008,
                    15.5,
                    "Naughty, allergic to chicken."
            ));
        }
    }

    private void seedVetProfileAndSchedule(User vetUser) {
        if (vetUser == null) {
            log.info("Vet user is null. Skipping vet profile seeding.");
            return;
        }

        if (vetProfileRepository.existsByUserId(vetUser.getId())) {
            log.info("Vet profile for user '{}' already exists. Skipping vet profile seeding.", vetUser.getUsername());
            return;
        }

        log.info("Seeding vet profile and schedule for user '{}'", vetUser.getUsername());

        // Create vet profile
        VetProfile profile = new VetProfile(vetUser);
        profile.setBio("Experienced small animal veterinarian focused on preventive care.");
        profile.setAcceptsNewPatients(true);
        profile.setAverageVisitLengthMinutes(30);
        profile.setSpecializations(Set.of(
                VetSpecialization.GENERAL_PRACTICE,
                VetSpecialization.SURGERY
        ));

        vetProfileRepository.save(profile);

        // Clear any schedule entries just in case
        vetScheduleEntryRepository.deleteByVetProfile(profile);

        // Seed a simple weekly schedule: Mon–Fri 09:00–13:00 with 30-minute slots
        for (DayOfWeek day : new DayOfWeek[]{
                DayOfWeek.MONDAY,
                DayOfWeek.TUESDAY,
                DayOfWeek.WEDNESDAY,
                DayOfWeek.THURSDAY,
                DayOfWeek.FRIDAY
        }) {
            VetScheduleEntry entry = new VetScheduleEntry();
            entry.setVetProfile(profile);
            entry.setDayOfWeek(day);
            entry.setStartTime(LocalTime.of(9, 0));
            entry.setEndTime(LocalTime.of(13, 0));
            entry.setSlotLengthMinutes(30);
            vetScheduleEntryRepository.save(entry);
        }

        log.info("Vet profile and schedule seeded for user '{}'", vetUser.getUsername());
    }
}
