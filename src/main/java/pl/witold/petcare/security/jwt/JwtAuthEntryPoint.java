package pl.witold.petcare.security.jwt;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

import static pl.witold.petcare.security.jwt.JwtAuthFilter.JWT_ERROR_ATTR;

/**
 * Custom entry point for handling unauthorized requests (invalid JWT, missing token, etc.)
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

        int status;
        String message;

        switch (jwtError) {
            case "TOKEN_EXPIRED" -> {
                status = HttpServletResponse.SC_FORBIDDEN;
                message = "JWT token has expired";
            }
            case "INVALID_SIGNATURE" -> {
                status = HttpServletResponse.SC_FORBIDDEN;
                message = "Invalid JWT signature";
            }
            case "INVALID_TOKEN" -> {
                status = HttpServletResponse.SC_FORBIDDEN;
                message = "Invalid JWT token";
            }
            case null, default -> {
                status = HttpServletResponse.SC_UNAUTHORIZED;
                message = "Authentication is required to access this resource";
            }
        }

        response.setStatus(status);
        response.setContentType("application/json");

        Map<String, Object> body = new HashMap<>();
        body.put("status", status);
        body.put("error", status == 401 ? "Unauthorized" : "Forbidden");
        body.put("message", message);
        body.put("path", request.getRequestURI());

        objectMapper.writeValue(response.getOutputStream(), body);
    }
}
