package pl.witold.petcare.dto;

/**
 * Represents authentication response containing JWT token.
 */
public record AuthResponse(
        String accessToken,
        String tokenType
) {
    public static AuthResponse bearer(String token) {
        return new AuthResponse(token, "Bearer");
    }
}
