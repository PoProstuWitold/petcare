package pl.witold.petcare.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Represents registration data for a new user.
 */
public record RegisterRequest(

        @NotBlank(message = "Full name cannot be empty")
        @Size(max = 128)
        String fullName,

        @NotBlank(message = "Username cannot be empty")
        @Size(max = 64)
        String username,

        @NotBlank(message = "Email cannot be empty")
        @Email
        String email,

        @NotBlank(message = "Password cannot be empty")
        @Size(min = 8, max = 64)
        String password
) {}
