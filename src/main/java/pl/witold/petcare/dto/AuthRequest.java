package pl.witold.petcare.dto;

import jakarta.validation.constraints.NotBlank;

/**
 * Represents login credentials for authentication.
 */
public record AuthRequest(

        @NotBlank(message = "Username cannot be empty")
        String username,

        @NotBlank(message = "Password cannot be empty")
        String password
) {
}
