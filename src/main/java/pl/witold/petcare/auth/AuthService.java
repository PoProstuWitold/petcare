package pl.witold.petcare.auth;

import pl.witold.petcare.dto.*;

/**
 * Handles user authentication and registration logic.
 */
public interface AuthService {
    AuthResponse login(AuthRequest request);
    UserResponseDto register(RegisterRequest request);
    UserResponseDto getCurrentUser(String username);
}
