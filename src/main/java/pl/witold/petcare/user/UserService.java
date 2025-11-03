package pl.witold.petcare.user;

public interface UserService {
    User register(String username, String email, String rawPassword);
    User findByUsernameOrThrow(String username);
}
