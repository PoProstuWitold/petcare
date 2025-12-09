package pl.witold.petcare.pet;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.test.web.servlet.MockMvc;
import pl.witold.petcare.dto.PetImportDto;
import pl.witold.petcare.security.jwt.JwtService;
import pl.witold.petcare.user.User;
import pl.witold.petcare.user.UserService;

import java.util.List;

import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = PetController.class)
@AutoConfigureMockMvc(addFilters = false)
@Import(PetMapper.class)
class PetControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;
    @Autowired
    private ObjectMapper objectMapper;
    @Autowired
    private PetService petService;
    @Autowired
    private UserService userService;

    @TestConfiguration
    static class Cfg {
        @Bean
        PetService petService() {
            return Mockito.mock(PetService.class);
        }

        @Bean
        UserService userService() {
            return Mockito.mock(UserService.class);
        }

        @Bean
        JwtService jwtService() {
            return Mockito.mock(JwtService.class);
        }

        @Bean
        UserDetailsService userDetailsService() {
            return Mockito.mock(UserDetailsService.class);
        }
    }

    @Test
    @DisplayName("GET /api/pets/me/export returns pet import JSON for current user")
    void exportMyPets() throws Exception {
        User current = Mockito.mock(User.class);
        when(current.getId()).thenReturn(7L);
        when(current.getFullName()).thenReturn("Witold Zawada");
        when(userService.getByUsername(eq("witq"))).thenReturn(current);

        Pet pet1 = new Pet(current, "Sara", Species.DOG, Sex.FEMALE, "Mixed", null, 2021, 9.2, "friendly");
        Pet pet2 = new Pet(current, "Yuki", Species.CAT, Sex.FEMALE, "European", null, 2022, 3.6, null);
        when(petService.getByOwnerId(eq(7L))).thenReturn(List.of(pet1, pet2));

        UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken("witq", "pw");
        mockMvc.perform(get("/api/pets/me/export").principal(auth))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].name").value("Sara"))
                .andExpect(jsonPath("$[0].species").value("DOG"))
                .andExpect(jsonPath("$[1].name").value("Yuki"))
                .andExpect(jsonPath("$[1].species").value("CAT"));
    }

    @Test
    @DisplayName("POST /api/pets/me/import accepts array of PetImportDto and returns created DTOs")
    void importMyPets() throws Exception {
        User current = Mockito.mock(User.class);
        when(current.getId()).thenReturn(7L);
        when(current.getFullName()).thenReturn("Witold Zawada");
        when(userService.getByUsername(eq("witq"))).thenReturn(current);

        PetImportDto in1 = new PetImportDto("Sara", Species.DOG, Sex.FEMALE, "Mixed", null, 2021, 9.2, null);
        PetImportDto in2 = new PetImportDto("Yuki", Species.CAT, Sex.FEMALE, null, null, 2022, 3.6, null);

        User ownerMock = Mockito.mock(User.class);
        when(ownerMock.getId()).thenReturn(7L);
        when(ownerMock.getFullName()).thenReturn("Witold Zawada");

        Pet out1 = Mockito.mock(Pet.class);
        Mockito.when(out1.getId()).thenReturn(101L);
        Mockito.when(out1.getOwner()).thenReturn(ownerMock);
        Mockito.when(out1.getName()).thenReturn("Sara");
        Mockito.when(out1.getSpecies()).thenReturn(Species.DOG);
        Mockito.when(out1.getSex()).thenReturn(Sex.FEMALE);
        Mockito.when(out1.getBreed()).thenReturn("Mixed");
        Mockito.when(out1.getBirthDate()).thenReturn(null);
        Mockito.when(out1.getBirthYear()).thenReturn(2021);
        Mockito.when(out1.getWeight()).thenReturn(9.2);
        Mockito.when(out1.getNotes()).thenReturn(null);

        Pet out2 = Mockito.mock(Pet.class);
        Mockito.when(out2.getId()).thenReturn(102L);
        Mockito.when(out2.getOwner()).thenReturn(ownerMock);
        Mockito.when(out2.getName()).thenReturn("Yuki");
        Mockito.when(out2.getSpecies()).thenReturn(Species.CAT);
        Mockito.when(out2.getSex()).thenReturn(Sex.FEMALE);
        Mockito.when(out2.getBreed()).thenReturn(null);
        Mockito.when(out2.getBirthDate()).thenReturn(null);
        Mockito.when(out2.getBirthYear()).thenReturn(2022);
        Mockito.when(out2.getWeight()).thenReturn(3.6);
        Mockito.when(out2.getNotes()).thenReturn(null);

        when(petService.importForOwner(eq(7L), anyList())).thenReturn(List.of(out1, out2));

        UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken("witq", "pw");
        String payload = objectMapper.writeValueAsString(List.of(in1, in2));

        mockMvc.perform(post("/api/pets/me/import")
                        .principal(auth)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(101))
                .andExpect(jsonPath("$[0].ownerFullName").value("Witold Zawada"))
                .andExpect(jsonPath("$[0].name").value("Sara"))
                .andExpect(jsonPath("$[1].name").value("Yuki"));
    }
}
