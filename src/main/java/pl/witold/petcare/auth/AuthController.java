package pl.witold.petcare.auth;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.parameters.RequestBody;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import pl.witold.petcare.dto.AuthRequest;
import pl.witold.petcare.dto.AuthResponse;
import pl.witold.petcare.dto.RegisterRequest;
import pl.witold.petcare.dto.UserResponseDto;

/**
 * REST controller for authentication and registration endpoints.
 */
@Tag(
        name = "Authentication",
        description = "User authentication, registration and current user info"
)
@RestController
@RequestMapping("${api.prefix:/api}/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @Operation(
            summary = "Login and obtain JWT token",
            description = "Authenticates user with email and password and returns a JWT token that can be used for "
                    + "authorized requests."
    )
    @ApiResponse(
            responseCode = "200",
            description = "User authenticated successfully",
            content = @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = AuthResponse.class)
            )
    )
    @ApiResponse(
            responseCode = "401",
            description = "Invalid credentials"
    )
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(
            @Valid
            @RequestBody(
                    description = "User credentials for authentication",
                    required = true,
                    content = @Content(
                            schema = @Schema(implementation = AuthRequest.class)
                    )
            )
            @org.springframework.web.bind.annotation.RequestBody AuthRequest request
    ) {
        return ResponseEntity.ok(authService.login(request));
    }

    @Operation(
            summary = "Register new user",
            description = "Registers a new user account in the system."
    )
    @ApiResponse(
            responseCode = "200",
            description = "User registered successfully",
            content = @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = UserResponseDto.class)
            )
    )
    @ApiResponse(
            responseCode = "400",
            description = "Validation error in registration data"
    )
    @PostMapping("/register")
    public ResponseEntity<UserResponseDto> register(
            @Valid
            @RequestBody(
                    description = "Registration payload for a new user",
                    required = true,
                    content = @Content(
                            schema = @Schema(implementation = RegisterRequest.class)
                    )
            )
            @org.springframework.web.bind.annotation.RequestBody RegisterRequest request
    ) {
        return ResponseEntity.ok(authService.register(request));
    }

    @Operation(
            summary = "Get current authenticated user",
            description = "Returns details of the currently authenticated user based on the JWT token."
    )
    @ApiResponse(
            responseCode = "200",
            description = "Current user data returned successfully",
            content = @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = UserResponseDto.class)
            )
    )
    @ApiResponse(
            responseCode = "401",
            description = "User is not authenticated"
    )
    @GetMapping("/me")
    public ResponseEntity<UserResponseDto> getCurrentUser(Authentication authentication) {
        return ResponseEntity.ok(authService.getCurrentUser(authentication.getName()));
    }
}
