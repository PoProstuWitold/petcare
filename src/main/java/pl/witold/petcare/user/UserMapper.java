package pl.witold.petcare.user;

import pl.witold.petcare.dto.UserResponseDto;

/**
 * Mapper responsible for converting between User entity and UserResponseDto.
 */
public class UserMapper {

    private UserMapper() {
        // Utility class
    }

    public static UserResponseDto toDto(User user) {
        return new UserResponseDto(
                user.getId(),
                user.getFullName(),
                user.getUsername(),
                user.getEmail(),
                user.getRoles()
        );
    }
}
