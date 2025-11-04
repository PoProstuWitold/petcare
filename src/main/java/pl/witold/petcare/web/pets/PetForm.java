package pl.witold.petcare.web.pets;

import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.Setter;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDate;

@Setter
@Getter
public class PetForm {

    @NotBlank(message = "Name is required")
    @Size(max = 64)
    private String name;

    @NotBlank(message = "Species is required")
    private String species;

    private String sex;

    @Size(max = 64)
    private String breed;

    @NotNull(message = "Birth year is required")
    @Min(1990)
    @Max(2025)
    private Integer birthYear;

    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
    private LocalDate birthDate;

    @DecimalMin(value = "0.1", message = "Weight must be positive")
    private Double weight;

    @Size(max = 512)
    private String notes;
}