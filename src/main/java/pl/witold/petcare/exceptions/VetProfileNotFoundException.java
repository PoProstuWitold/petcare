package pl.witold.petcare.exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * Exception thrown when a vet profile cannot be found.
 */
@ResponseStatus(HttpStatus.NOT_FOUND)
public class VetProfileNotFoundException extends RuntimeException {
    public VetProfileNotFoundException(String message) {
        super(message);
    }
}
