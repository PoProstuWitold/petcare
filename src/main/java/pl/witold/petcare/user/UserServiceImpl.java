package pl.witold.petcare.user;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pl.witold.petcare.exceptions.FieldIsAlreadyTakenException;
import pl.witold.petcare.exceptions.UserNotFoundException;
import pl.witold.petcare.user.commands.UserRegistrationCommand;

import java.util.List;
import java.util.Set;

/**
 * Implementation of the UserService interface.
 * Handles all business logic related to users.
 */
@Service
@RequiredArgsConstructor
@Transactional
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public User create(UserRegistrationCommand command) {
        if (userRepository.existsByUsername(command.username())) {
            throw new FieldIsAlreadyTakenException("Username is already taken");
        }
        if (userRepository.existsByEmail(command.email())) {
            throw new FieldIsAlreadyTakenException("Email is already taken");
        }

        String hashedPassword = passwordEncoder.encode(command.password());

        User user = new User(
                command.fullName(),
                command.username(),
                command.email(),
                hashedPassword,
                Set.of(Role.USER)
        );

        return userRepository.save(user);
    }

    @Override
    public User update(Long id, User updatedUser) {
        User existing = getById(id);
        existing.setFullName(updatedUser.getFullName());
        existing.setEmail(updatedUser.getEmail());
        existing.setUsername(updatedUser.getUsername());
        return userRepository.save(existing);
    }

    @Override
    @Transactional(readOnly = true)
    public User getById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new UserNotFoundException("User with ID " + id + " not found"));
    }

    @Override
    @Transactional(readOnly = true)
    public User getByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new UserNotFoundException("User with username " + username + " not found"));
    }

    @Override
    @Transactional(readOnly = true)
    public User getByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("User with email " + email + " not found"));
    }

    @Override
    @Transactional(readOnly = true)
    public List<User> getAll() {
        return userRepository.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    public Page<User> getAll(Pageable pageable) {
        return userRepository.findAll(pageable);
    }

    @Override
    public boolean existsByUsername(String username) {
        return userRepository.existsByUsername(username);
    }

    @Override
    public boolean existsByEmail(String email) {
        return userRepository.existsByEmail(email);
    }

    @Override
    public void deleteById(Long id) {
        User user = getById(id);
        userRepository.delete(user);
    }

    @Override
    public void changePassword(Long userId, String rawNewPassword) {
        User user = getById(userId);
        user.setPasswordHash(passwordEncoder.encode(rawNewPassword));
        userRepository.save(user);
    }

    @Override
    public void updateRoles(Long userId, Set<Role> roles) {
        User user = getById(userId);
        user.setRoles(roles);
        userRepository.save(user);
    }
}
