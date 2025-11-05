package pl.witold.petcare.dto;

import java.util.Set;
import pl.witold.petcare.user.Role;

/**
 * DTO for returning user data in API responses.
 */
public record UserResponseDto(
        Long id,
        String fullName,
        String username,
        String email,
        Set<Role> roles
) {}
