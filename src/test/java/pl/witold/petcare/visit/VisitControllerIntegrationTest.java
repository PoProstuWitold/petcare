package pl.witold.petcare.visit;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Bean;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.test.web.servlet.MockMvc;
import pl.witold.petcare.security.jwt.JwtService;
import pl.witold.petcare.visit.commands.VisitCreateCommand;
import pl.witold.petcare.pet.Pet;
import pl.witold.petcare.user.User;
import pl.witold.petcare.vet.VetProfile;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = VisitController.class)
@AutoConfigureMockMvc(addFilters = false)
class VisitControllerIntegrationTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private ObjectMapper objectMapper;
    @Autowired private VisitService visitService;

    @org.springframework.boot.test.context.TestConfiguration
    static class Cfg {
        @Bean VisitService visitService() { return Mockito.mock(VisitService.class); }
        @Bean JwtService jwtService() { return Mockito.mock(JwtService.class); }
        @Bean UserDetailsService userDetailsService() { return Mockito.mock(UserDetailsService.class); }
    }

    @Test
    @DisplayName("POST /api/visits returns 201 for valid create")
    void createVisitValid() throws Exception {
        Visit visit = Mockito.mock(Visit.class);
        when(visit.getId()).thenReturn(10L);
        when(visit.getDate()).thenReturn(LocalDate.now().plusDays(1));
        when(visit.getStartTime()).thenReturn(LocalTime.of(10,0));
        when(visit.getEndTime()).thenReturn(LocalTime.of(10,30));
        when(visit.getStatus()).thenReturn(VisitStatus.SCHEDULED);
        // Stub nested relations for VisitMapper
        Pet pet = Mockito.mock(Pet.class);
        User owner = Mockito.mock(User.class);
        when(owner.getId()).thenReturn(100L);
        when(owner.getFullName()).thenReturn("Owner Name");
        when(pet.getId()).thenReturn(200L);
        when(pet.getOwner()).thenReturn(owner);
        when(visit.getPet()).thenReturn(pet);
        VetProfile vetProfile = Mockito.mock(VetProfile.class);
        User vetUser = Mockito.mock(User.class);
        when(vetUser.getId()).thenReturn(300L);
        when(vetUser.getFullName()).thenReturn("Vet User");
        when(vetProfile.getId()).thenReturn(400L);
        when(vetProfile.getUser()).thenReturn(vetUser);
        when(visit.getVetProfile()).thenReturn(vetProfile);

        when(visitService.createVisit(any())).thenReturn(visit);

        VisitCreateCommand cmd = new VisitCreateCommand(1L, 2L, LocalDate.now().plusDays(1), LocalTime.of(10,0), "Reason", null);
        String payload = objectMapper.writeValueAsString(cmd);

        mockMvc.perform(post("/api/visits")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value("SCHEDULED"));
    }

    @Test
    @DisplayName("GET /api/visits/by-vet/{vetId}?date returns list")
    void listByVetAndDate() throws Exception {
        Visit visit = Mockito.mock(Visit.class);
        when(visit.getId()).thenReturn(11L);
        when(visit.getDate()).thenReturn(LocalDate.now().plusDays(2));
        when(visit.getStartTime()).thenReturn(LocalTime.of(9,0));
        when(visit.getEndTime()).thenReturn(LocalTime.of(9,30));
        when(visit.getStatus()).thenReturn(VisitStatus.SCHEDULED);
        // Stub nested relations for VisitMapper
        Pet pet = Mockito.mock(Pet.class);
        User owner = Mockito.mock(User.class);
        when(owner.getId()).thenReturn(101L);
        when(owner.getFullName()).thenReturn("Owner Name");
        when(pet.getId()).thenReturn(201L);
        when(pet.getOwner()).thenReturn(owner);
        when(visit.getPet()).thenReturn(pet);
        VetProfile vetProfile = Mockito.mock(VetProfile.class);
        User vetUser = Mockito.mock(User.class);
        when(vetUser.getId()).thenReturn(301L);
        when(vetUser.getFullName()).thenReturn("Vet User");
        when(vetProfile.getId()).thenReturn(401L);
        when(vetProfile.getUser()).thenReturn(vetUser);
        when(visit.getVetProfile()).thenReturn(vetProfile);

        Page<Visit> visitPage = new PageImpl<>(List.of(visit));
        when(visitService.getVisitsForVetAndDate(eq(5L), eq(LocalDate.now().plusDays(2)), any(Pageable.class))).thenReturn(visitPage);

        mockMvc.perform(get("/api/visits/by-vet/5").param("date", LocalDate.now().plusDays(2).toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].id").value(11));
    }
}
