package pl.witold.petcare.exceptions;

/**
 * Thrown when attempting to create a medical record for a visit whose status
 * is not among the allowed statuses (e.g. only CONFIRMED or COMPLETED allowed).
 */
public class MedicalRecordStatusNotAllowedException extends RuntimeException {
    public MedicalRecordStatusNotAllowedException(String message) {
        super(message);
    }
}

