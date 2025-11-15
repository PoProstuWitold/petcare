package pl.witold.petcare.exceptions;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.ResponseEntity;
import org.springframework.mock.web.MockHttpServletRequest;
import pl.witold.petcare.dto.ApiErrorResponse;

import static org.junit.jupiter.api.Assertions.*;

class GlobalExceptionHandlerTest {

    private final GlobalExceptionHandler handler = new GlobalExceptionHandler();

    @Test
    @DisplayName("IllegalArgumentException with booking keywords -> 422 Unprocessable Entity")
    void illegalArgumentYields422() {
        MockHttpServletRequest req = new MockHttpServletRequest();
        req.setRequestURI("/api/visits");
        String[] msgs = new String[] {
                "Requested time is outside vet working hours",
                "Selected time slot is already taken",
                "Visit date cannot be in the past",
                "Visit start time cannot be in the past",
                "Vet is on time off on the selected date"
        };

        for (String msg : msgs) {
            ResponseEntity<ApiErrorResponse> resp = handler.handleIllegalArgument(new IllegalArgumentException(msg), req);
            assertEquals(422, resp.getStatusCode().value(), "Message should map to 422: " + msg);
            ApiErrorResponse body = resp.getBody();
            assertNotNull(body);
            assertTrue(body.message().contains(msg));
        }
    }

    @Test
    @DisplayName("IllegalArgumentException default -> 400 Bad Request")
    void illegalArgumentDefault400() {
        MockHttpServletRequest req = new MockHttpServletRequest();
        req.setRequestURI("/api/any");
        ResponseEntity<ApiErrorResponse> resp = handler.handleIllegalArgument(new IllegalArgumentException("Other error"), req);
        assertEquals(400, resp.getStatusCode().value());
    }
}
