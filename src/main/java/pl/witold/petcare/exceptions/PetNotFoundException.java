package pl.witold.petcare.exceptions;

public class PetNotFoundException extends NotFoundException {
    public PetNotFoundException(String message) { super(message); }
}