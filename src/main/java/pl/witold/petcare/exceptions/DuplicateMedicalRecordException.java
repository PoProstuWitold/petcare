package pl.witold.petcare.exceptions;

/**
 * Thrown when attempting to create a medical record for a visit that already has one.
 */
public class DuplicateMedicalRecordException extends RuntimeException {
    public DuplicateMedicalRecordException(String message) {
        super(message);
    }
}

