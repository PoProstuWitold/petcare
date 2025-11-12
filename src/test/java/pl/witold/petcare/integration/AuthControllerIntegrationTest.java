package pl.witold.petcare.integration;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.test.web.servlet.MockMvc;
import pl.witold.petcare.auth.AuthService;
import pl.witold.petcare.auth.AuthController;
import pl.witold.petcare.dto.AuthRequest;
import pl.witold.petcare.dto.AuthResponse;
import pl.witold.petcare.dto.RegisterRequest;
import pl.witold.petcare.dto.UserResponseDto;
import pl.witold.petcare.user.Role;
import pl.witold.petcare.security.jwt.JwtService;
import org.springframework.security.core.userdetails.UserDetailsService;

import java.util.Set;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = AuthController.class)
@AutoConfigureMockMvc(addFilters = false)
class AuthControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private AuthService authService;

    @TestConfiguration
    static class TestConfig {
        @Bean AuthService authService() { return Mockito.mock(AuthService.class); }
        @Bean JwtService jwtService() { return Mockito.mock(JwtService.class); }
        @Bean UserDetailsService userDetailsService() { return Mockito.mock(UserDetailsService.class); }
    }

    @Test
    @DisplayName("POST /api/auth/login returns token when credentials valid")
    void loginReturnsToken() throws Exception {
        AuthResponse resp = AuthResponse.bearer("abcdef12345");
        when(authService.login(any(AuthRequest.class))).thenReturn(resp);

        AuthRequest req = new AuthRequest("witold", "secret");

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").value("abcdef12345"))
                .andExpect(jsonPath("$.tokenType").value("Bearer"));
    }

    @Test
    @DisplayName("POST /api/auth/register returns created user")
    void registerReturnsUser() throws Exception {
        UserResponseDto user = new UserResponseDto(1L, "Witold Zawada", "witq", "witq@petcare.local", Set.of(Role.USER));
        when(authService.register(any(RegisterRequest.class))).thenReturn(user);

        RegisterRequest req = new RegisterRequest("Witold Zawada", "witq", "witq@petcare.local", "password123");

        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.username").value("witq"))
                .andExpect(jsonPath("$.email").value("witq@petcare.local"));
    }

    @Test
    @DisplayName("GET /api/auth/me returns current user when authenticated")
    void meReturnsCurrentUser() throws Exception {
        UserResponseDto userDto = new UserResponseDto(2L, "Witold Zawada", "witq", "witq@petcare.local", Set.of(Role.USER));
        when(authService.getCurrentUser("witq")).thenReturn(userDto);

        UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken("witq", "password");
        mockMvc.perform(get("/api/auth/me").principal(auth))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username").value("witq"))
                .andExpect(jsonPath("$.email").value("witq@petcare.local"));
    }
}
