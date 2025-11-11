package pl.witold.petcare.exceptions;

import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.security.SignatureException;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import pl.witold.petcare.dto.ApiErrorResponse;

import java.util.stream.Collectors;

/**
 * Global exception handler for REST API.
 * Converts all thrown exceptions into consistent JSON responses.
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ApiErrorResponse> handleDataIntegrity(DataIntegrityViolationException ex, HttpServletRequest request) {
        String rootMessage = ex.getRootCause() != null ? ex.getRootCause().getMessage() : ex.getMessage();
        String message;
        if (rootMessage != null && rootMessage.contains("FK_VET_PROFILES_ON_USER")) {
            message = "Cannot delete user: a veterinarian profile still references this account.";
        } else if (rootMessage != null && rootMessage.contains("FK_PETS_ON_OWNER")) {
            message = "Cannot delete user: pets are still assigned to this owner.";
        } else if (rootMessage != null && rootMessage.toLowerCase().contains("users") && rootMessage.toLowerCase().contains("unique")) {
            message = "User with the same username or email already exists.";
        } else if (rootMessage != null && rootMessage.contains("UK_")) {
            message = "Unique constraint violated. A record with the same unique value already exists.";
        } else {
            message = "Data integrity violation – operation blocked by related data.";
        }
        ApiErrorResponse body = ApiErrorResponse.of(HttpStatus.CONFLICT, message, request.getRequestURI());
        return ResponseEntity.status(HttpStatus.CONFLICT).body(body);
    }

    // --- Not Found (unified) ---
    @ExceptionHandler(NotFoundException.class)
    public ResponseEntity<ApiErrorResponse> handleNotFound(
            NotFoundException ex,
            HttpServletRequest request
    ) {
        return buildResponse(HttpStatus.NOT_FOUND, ex, request);
    }

    // --- Custom domain exceptions ---

    @ExceptionHandler(FieldIsAlreadyTakenException.class)
    public ResponseEntity<ApiErrorResponse> handleFieldTaken(
            FieldIsAlreadyTakenException ex,
            HttpServletRequest request
    ) {
        return buildResponse(HttpStatus.CONFLICT, ex, request);
    }

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ApiErrorResponse> handleInvalidCredentials(
            BadCredentialsException ex,
            HttpServletRequest request
    ) {
        return buildResponse(HttpStatus.UNAUTHORIZED, ex, request);
    }

    @ExceptionHandler(DuplicateMedicalRecordException.class)
    public ResponseEntity<ApiErrorResponse> handleDuplicateMedicalRecord(
            DuplicateMedicalRecordException ex,
            HttpServletRequest request
    ) {
        return buildResponse(HttpStatus.CONFLICT, ex, request);
    }

    // --- Validation ---

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiErrorResponse> handleValidation(
            MethodArgumentNotValidException ex,
            HttpServletRequest request
    ) {
        HttpStatus status = HttpStatus.BAD_REQUEST;

        String message = ex.getBindingResult()
                .getFieldErrors()
                .stream()
                .map(fieldError -> fieldError.getField() + ": " + fieldError.getDefaultMessage())
                .collect(Collectors.joining(", "));

        log.debug("Validation failed: {}", message);

        ApiErrorResponse body = ApiErrorResponse.of(status, message, request.getRequestURI());
        return ResponseEntity.status(status).body(body);
    }

    // --- Security-related ---

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ApiErrorResponse> handleAccessDenied(
            AccessDeniedException ignored,
            HttpServletRequest request
    ) {
        return buildResponse(HttpStatus.FORBIDDEN, "Access denied: insufficient permissions", request);
    }

    @ExceptionHandler({ExpiredJwtException.class, SignatureException.class})
    public ResponseEntity<ApiErrorResponse> handleJwtErrors(
            Exception ex,
            HttpServletRequest request
    ) {
        HttpStatus status = HttpStatus.FORBIDDEN;
        String message = switch (ex) {
            case ExpiredJwtException ignored -> "JWT token has expired";
            case SignatureException ignored -> "Invalid JWT signature";
            default -> "Invalid or expired JWT token";
        };

        log.debug("JWT error: {}", ex.getMessage());
        ApiErrorResponse body = ApiErrorResponse.of(status, message, request.getRequestURI());
        return ResponseEntity.status(status).body(body);
    }

    // --- Catch-all fallback ---

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiErrorResponse> handleOtherExceptions(
            Exception ex,
            HttpServletRequest request
    ) {
        log.error("Unexpected error", ex);
        return buildResponse(HttpStatus.INTERNAL_SERVER_ERROR, "Unexpected server error occurred", request);
    }

    // --- Utility methods ---

    private ResponseEntity<ApiErrorResponse> buildResponse(HttpStatus status, Exception ex, HttpServletRequest request) {
        log.debug("{}: {}", ex.getClass().getSimpleName(), ex.getMessage());
        ApiErrorResponse body = ApiErrorResponse.of(status, ex.getMessage(), request.getRequestURI());
        return ResponseEntity.status(status).body(body);
    }

    private ResponseEntity<ApiErrorResponse> buildResponse(HttpStatus status, String message, HttpServletRequest request) {
        ApiErrorResponse body = ApiErrorResponse.of(status, message, request.getRequestURI());
        return ResponseEntity.status(status).body(body);
    }
}
