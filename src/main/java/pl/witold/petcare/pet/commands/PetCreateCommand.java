package pl.witold.petcare.pet.commands;

import pl.witold.petcare.pet.Sex;
import pl.witold.petcare.pet.Species;

import java.time.LocalDate;

public record PetCreateCommand(
        Long ownerId,
        String name,
        Species species,
        Sex sex,
        String breed,
        LocalDate birthDate,
        Integer birthYear,
        Double weight,
        String notes
) {}
