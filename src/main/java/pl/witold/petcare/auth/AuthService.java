package pl.witold.petcare.auth;

import pl.witold.petcare.dto.AuthRequest;
import pl.witold.petcare.dto.AuthResponse;
import pl.witold.petcare.dto.RegisterRequest;
import pl.witold.petcare.dto.UserResponseDto;

/**
 * Handles user authentication and registration logic.
 */
public interface AuthService {
    AuthResponse login(AuthRequest request);
    UserResponseDto register(RegisterRequest request);
    UserResponseDto getCurrentUser(String username);
}
