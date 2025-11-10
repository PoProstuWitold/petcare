package pl.witold.petcare.exceptions;

/**
 * Exception thrown when a vet profile cannot be found.
 */
public class VetProfileNotFoundException extends NotFoundException {
    public VetProfileNotFoundException(String message) {
        super(message);
    }
}
