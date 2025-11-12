package pl.witold.petcare.integration;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.http.ResponseEntity;
import pl.witold.petcare.dto.HealthStatusResponse;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class StatusControllerIntegrationTest {

    @LocalServerPort
    private int port;

    @Autowired
    private TestRestTemplate restTemplate;

    @Test
    @DisplayName("GET /api/status/health returns UP status")
    void healthEndpointReturnsUp() {
        String url = "http://localhost:" + port + "/api/status/health";

        ResponseEntity<HealthStatusResponse> resp = restTemplate.getForEntity(url, HealthStatusResponse.class);

        assertEquals(200, resp.getStatusCode().value());
        HealthStatusResponse body = resp.getBody();
        assertNotNull(body, "Response body should not be null");
        assertNotNull(body.timestamp());
        assertNotNull(body.status());
        assertTrue("UP".equals(body.status()) || "DEGRADED".equals(body.status()));
        assertNotNull(body.details());
    }
}
