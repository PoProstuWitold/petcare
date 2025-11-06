package pl.witold.petcare.exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * Exception thrown when a vet time-off entry cannot be found.
 */
@ResponseStatus(HttpStatus.NOT_FOUND)
public class VetTimeOffNotFoundException extends RuntimeException {

    public VetTimeOffNotFoundException(String message) {
        super(message);
    }
}
