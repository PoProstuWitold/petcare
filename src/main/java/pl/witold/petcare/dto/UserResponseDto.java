package pl.witold.petcare.dto;

import pl.witold.petcare.user.Role;

import java.util.Set;

/**
 * DTO for returning user data in API responses.
 */
public record UserResponseDto(
        Long id,
        String fullName,
        String username,
        String email,
        Set<Role> roles
) {
}
