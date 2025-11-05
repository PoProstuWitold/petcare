package pl.witold.petcare.exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.CONFLICT)
public class FieldIsAlreadyTakenException extends RuntimeException {
    public FieldIsAlreadyTakenException(String message) {
        super(message);
    }
}