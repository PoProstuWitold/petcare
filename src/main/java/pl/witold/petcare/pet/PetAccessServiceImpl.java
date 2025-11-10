package pl.witold.petcare.pet;

import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import pl.witold.petcare.security.CurrentUserService;
import pl.witold.petcare.user.Role;
import pl.witold.petcare.user.User;

/**
 * Default implementation of PetAccessService.
 * Admins and vets can access all pets. Regular users can only access their own pets.
 */
@Service
@RequiredArgsConstructor
public class PetAccessServiceImpl implements PetAccessService {

    private final CurrentUserService currentUserService;

    @Override
    public void checkCanView(Pet pet) {
        if (!canView(pet)) {
            throw new AccessDeniedException("You are not allowed to view this pet");
        }
    }

    @Override
    public void checkCanModify(Pet pet) {
        if (!canModify(pet)) {
            throw new AccessDeniedException("You are not allowed to modify this pet");
        }
    }

    @Override
    public boolean canView(Pet pet) {
        if (pet == null) {
            return false;
        }
        if (currentUserService.hasAnyRole(Role.ADMIN, Role.VET)) {
            return true;
        }
        User currentUser = currentUserService.getCurrentUser();
        return pet.getOwner().getId().equals(currentUser.getId());
    }

    @Override
    public boolean canModify(Pet pet) {
        if (pet == null) {
            return false;
        }
        if (currentUserService.hasAnyRole(Role.ADMIN, Role.VET)) {
            return true;
        }
        User currentUser = currentUserService.getCurrentUser();
        return pet.getOwner().getId().equals(currentUser.getId());
    }
}
