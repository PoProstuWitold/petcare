package pl.witold.petcare.user;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import pl.witold.petcare.user.commands.UserRegistrationCommand;

import java.util.List;
import java.util.Set;

public interface UserService {
    User create(UserRegistrationCommand command);
    User update(Long id, User updatedUser);
    User getById(Long id);
    User getByUsername(String username);
    User getByEmail(String email);
    List<User> getAll();
    Page<User> getAll(Pageable pageable);
    boolean existsByUsername(String username);
    boolean existsByEmail(String email);
    void deleteById(Long id);
    void changePassword(Long userId, String rawNewPassword);
    void updateRoles(Long userId, Set<Role> roles);
}
