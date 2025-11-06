package pl.witold.petcare.user.commands;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Command used for changing user's password.
 * This is typically invoked by an administrator.
 */
public record PasswordChangeCommand(
        @NotBlank(message = "New password cannot be empty")
        @Size(min = 8, max = 64, message = "Password must be between 8 and 64 characters")
        String newPassword
) {
}