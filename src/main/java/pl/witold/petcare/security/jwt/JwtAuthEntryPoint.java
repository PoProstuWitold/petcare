package pl.witold.petcare.security.jwt;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;
import pl.witold.petcare.dto.ApiErrorResponse;

import java.io.IOException;

import static pl.witold.petcare.security.jwt.JwtAuthFilter.JWT_ERROR_ATTR;

/**
 * Custom entry point for handling unauthorized requests (invalid JWT, missing token, etc.).
 * Produces a consistent ApiErrorResponse JSON body.
 */
@Component
public class JwtAuthEntryPoint implements AuthenticationEntryPoint {

    private final ObjectMapper objectMapper;

    public JwtAuthEntryPoint(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    @Override
    public void commence(
            HttpServletRequest request,
            HttpServletResponse response,
            AuthenticationException authException
    ) throws IOException {

        String jwtError = (String) request.getAttribute(JWT_ERROR_ATTR);

        HttpStatus status;
        String message;

        switch (jwtError) {
            case "TOKEN_EXPIRED" -> {
                status = HttpStatus.FORBIDDEN;
                message = "JWT token has expired";
            }
            case "INVALID_SIGNATURE" -> {
                status = HttpStatus.FORBIDDEN;
                message = "Invalid JWT signature";
            }
            case "INVALID_TOKEN" -> {
                status = HttpStatus.FORBIDDEN;
                message = "Invalid JWT token";
            }
            case null, default -> {
                status = HttpStatus.UNAUTHORIZED;
                message = "Authentication is required to access this resource";
            }
        }

        ApiErrorResponse body = ApiErrorResponse.of(status, message, request.getRequestURI());

        response.setStatus(status.value());
        response.setContentType("application/json");
        objectMapper.writeValue(response.getOutputStream(), body);
    }
}
