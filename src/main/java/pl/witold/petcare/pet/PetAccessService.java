package pl.witold.petcare.pet;


/**
 * Service responsible for evaluating access rules related to Pet resources.
 */
public interface PetAccessService {

    /**
     * Checks if the current user is allowed to view the given pet.
     * Throws AccessDeniedException if access is not allowed.
     */
    void checkCanView(Pet pet);

    /**
     * Checks if the current user is allowed to modify the given pet
     * (update or delete). Throws AccessDeniedException if access is not allowed.
     */
    void checkCanModify(Pet pet);

    /**
     * Returns true if the current user is allowed to view the given pet.
     */
    boolean canView(Pet pet);

    /**
     * Returns true if the current user is allowed to modify the given pet.
     */
    boolean canModify(Pet pet);
}
