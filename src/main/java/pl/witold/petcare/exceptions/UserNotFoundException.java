package pl.witold.petcare.exceptions;

public class UserNotFoundException extends NotFoundException {
    public UserNotFoundException(String message) { super(message); }
}