package pl.witold.petcare.user;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.ArraySchema;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.parameters.RequestBody;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pl.witold.petcare.dto.UserResponseDto;
import pl.witold.petcare.user.commands.PasswordChangeCommand;
import pl.witold.petcare.user.commands.UserRegistrationCommand;

import java.util.Set;

/**
 * REST controller for managing users.
 */
@Tag(
        name = "Users",
        description = "Fetching and managing application users and their roles"
)
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @Operation(
            summary = "Create a new user (admin)",
            description = "Creates a new user account. This endpoint is intended for administrators to create "
                    + "users manually. Public self-registration is handled by /api/auth/register."
    )
    @ApiResponse(
            responseCode = "200",
            description = "User created successfully",
            content = @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = UserResponseDto.class)
            )
    )
    @PostMapping
    public ResponseEntity<UserResponseDto> register(
            @Valid
            @RequestBody(
                    description = "Data required to create a new user",
                    required = true,
                    content = @Content(
                            schema = @Schema(implementation = UserRegistrationCommand.class)
                    )
            )
            @org.springframework.web.bind.annotation.RequestBody UserRegistrationCommand command
    ) {
        User user = userService.create(command);
        return ResponseEntity.ok(UserMapper.toDto(user));
    }

    @Operation(
            summary = "Get all users (admin)",
            description = "Returns a paginated list of all registered users in the system. Admin only. " +
                    "Supports pagination with parameters: page (default: 0), size (default: 20, max: 100), sort (e.g., username,asc)."
    )
    @ApiResponse(
            responseCode = "200",
            description = "Paginated list of users returned successfully",
            content = @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = Page.class)
            )
    )
    @GetMapping
    public ResponseEntity<Page<UserResponseDto>> getAll(
            @PageableDefault(size = 20) Pageable pageable
    ) {
        Page<User> users = userService.getAll(pageable);
        Page<UserResponseDto> result = users.map(UserMapper::toDto);
        return ResponseEntity.ok(result);
    }

    @Operation(
            summary = "Get user by id (admin)",
            description = "Returns a single user by id. Admin only."
    )
    @ApiResponse(
            responseCode = "200",
            description = "User found and returned",
            content = @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = UserResponseDto.class)
            )
    )
    @ApiResponse(
            responseCode = "404",
            description = "User not found"
    )
    @GetMapping("/{id}")
    public ResponseEntity<UserResponseDto> getById(
            @Parameter(description = "User id", example = "1")
            @PathVariable Long id
    ) {
        User user = userService.getById(id);
        return ResponseEntity.ok(UserMapper.toDto(user));
    }

    @Operation(
            summary = "Delete user (admin)",
            description = "Deletes a user by id. This operation is irreversible. Admin only."
    )
    @ApiResponse(
            responseCode = "204",
            description = "User deleted successfully"
    )
    @ApiResponse(
            responseCode = "404",
            description = "User not found"
    )
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @Parameter(description = "User id", example = "1")
            @PathVariable Long id
    ) {
        userService.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @Operation(
            summary = "Update user roles (admin)",
            description = "Replaces current roles of the user with the provided set. Admin only."
    )
    @ApiResponse(
            responseCode = "204",
            description = "User roles updated successfully"
    )
    @ApiResponse(
            responseCode = "404",
            description = "User not found"
    )
    @PatchMapping("/{id}/roles")
    public ResponseEntity<Void> updateRoles(
            @Parameter(description = "User id", example = "1")
            @PathVariable Long id,
            @RequestBody(
                    description = "Set of roles to assign to the user",
                    required = true,
                    content = @Content(
                            array = @ArraySchema(schema = @Schema(implementation = Role.class))
                    )
            )
            @org.springframework.web.bind.annotation.RequestBody Set<Role> roles
    ) {
        userService.updateRoles(id, roles);
        return ResponseEntity.noContent().build();
    }

    @Operation(
            summary = "Change user password (admin)",
            description = "Changes the password of the user identified by id. "
                    + "This is an admin-level operation; regular users should change their own password via dedicated endpoints."
    )
    @ApiResponse(
            responseCode = "204",
            description = "Password changed successfully"
    )
    @ApiResponse(
            responseCode = "404",
            description = "User not found"
    )
    @PatchMapping("/{id}/password")
    public ResponseEntity<Void> changePassword(
            @Parameter(description = "User id", example = "1")
            @PathVariable Long id,
            @Valid
            @RequestBody(
                    description = "New password payload",
                    required = true,
                    content = @Content(
                            schema = @Schema(implementation = PasswordChangeCommand.class)
                    )
            )
            @org.springframework.web.bind.annotation.RequestBody PasswordChangeCommand command
    ) {
        userService.changePassword(id, command.newPassword());
        return ResponseEntity.noContent().build();
    }
}
