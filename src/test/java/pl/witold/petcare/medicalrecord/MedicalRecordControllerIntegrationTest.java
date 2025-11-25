package pl.witold.petcare.medicalrecord;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Bean;
import org.springframework.http.MediaType;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.test.web.servlet.MockMvc;
import pl.witold.petcare.dto.MedicalRecordResponseDto;
import pl.witold.petcare.dto.PetResponseDto;
import pl.witold.petcare.dto.VetProfileResponseDto;
import pl.witold.petcare.dto.VisitResponseDto;
import pl.witold.petcare.medicalrecord.commands.MedicalRecordCreateCommand;
import pl.witold.petcare.security.jwt.JwtService;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.Optional;
import java.util.Set;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = MedicalRecordController.class)
@AutoConfigureMockMvc(addFilters = false)
class MedicalRecordControllerIntegrationTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private ObjectMapper objectMapper;
    @Autowired private MedicalRecordService medicalRecordService;

    @org.springframework.boot.test.context.TestConfiguration
    static class Cfg {
        @Bean MedicalRecordService medicalRecordService() { return Mockito.mock(MedicalRecordService.class); }
        @Bean JwtService jwtService() { return Mockito.mock(JwtService.class); }
        @Bean UserDetailsService userDetailsService() { return Mockito.mock(UserDetailsService.class); }
    }

    @Test
    @DisplayName("POST /api/medical-records returns 201 and payload on create")
    void createMedicalRecord() throws Exception {
        PetResponseDto petDto = new PetResponseDto(1L, 2L, "Owner Name", "Sara", pl.witold.petcare.pet.Species.DOG, pl.witold.petcare.pet.Sex.FEMALE, null, null, 2021, 9.2, null);
        VetProfileResponseDto vetDto = new VetProfileResponseDto(
                3L,
                4L,
                "Vet User",
                "vetuser",
                "vet@petcare.local",
                "Experienced vet",
                true,
                30,
                Set.of()
        );
        VisitResponseDto visitDto = new VisitResponseDto(5L, petDto, 3L, 4L, "Vet User", LocalDate.now().plusDays(1), LocalTime.of(10,0), LocalTime.of(10,30), pl.witold.petcare.visit.VisitStatus.SCHEDULED, "Reason", null);
        MedicalRecordResponseDto resp = new MedicalRecordResponseDto(10L, petDto, vetDto, visitDto, "Title", "Diag", "Treat", null, null, LocalDateTime.now());
        when(medicalRecordService.create(any())).thenReturn(resp);

        MedicalRecordCreateCommand cmd = new MedicalRecordCreateCommand(5L, "Title", "Diag", "Treat", null, null);
        String payload = objectMapper.writeValueAsString(cmd);

        mockMvc.perform(post("/api/medical-records")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(10))
                .andExpect(jsonPath("$.visit.id").value(5));
    }

    @Test
    @DisplayName("GET /api/medical-records/by-visit/{id} returns 404 when not found")
    void getByVisitNotFound() throws Exception {
        when(medicalRecordService.getByVisitId(999L)).thenReturn(Optional.empty());
        mockMvc.perform(get("/api/medical-records/by-visit/999"))
                .andExpect(status().isNotFound());
    }
}
