package pl.witold.petcare.user;

public interface UserService {

    /**
     * Registers a new regular USER account.
     *
     * @param fullName   full name of the person (first + last name in one field)
     * @param username   unique username used for login
     * @param email      unique email
     * @param rawPassword plain text password that will be encoded
     * @return persisted User entity
     */
    User register(String fullName, String username, String email, String rawPassword);

    User findByUsernameOrThrow(String username);
}
