package pl.witold.petcare.user.commands;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Command used for registering a new user.
 */
public record UserRegistrationCommand(
        @NotBlank(message = "Full name cannot be empty")
        @Size(max = 128, message = "Full name cannot exceed 128 characters")
        String fullName,

        @NotBlank(message = "Username cannot be empty")
        @Size(max = 64, message = "Username cannot exceed 64 characters")
        String username,

        @NotBlank(message = "Email cannot be empty")
        @Email(message = "Email must be valid")
        String email,

        @NotBlank(message = "Password cannot be empty")
        @Size(min = 8, max = 64, message = "Password must be between 8 and 64 characters")
        String password
) {}
