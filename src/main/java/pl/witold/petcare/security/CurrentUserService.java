package pl.witold.petcare.security;

import pl.witold.petcare.user.Role;
import pl.witold.petcare.user.User;

/**
 * Service providing information about the currently authenticated user.
 */
public interface CurrentUserService {

    /**
     * Returns the currently authenticated user.
     *
     * @throws org.springframework.security.access.AccessDeniedException if there is no authenticated user
     */
    User getCurrentUser();

    /**
     * Returns the id of the currently authenticated user.
     *
     * @throws org.springframework.security.access.AccessDeniedException if there is no authenticated user
     */
    Long getCurrentUserId();

    /**
     * Checks if the current user has the given role.
     *
     * @param role role to check
     * @return true if the current user has the role, false otherwise
     */
    boolean hasRole(Role role);
}