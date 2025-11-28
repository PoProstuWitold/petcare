package pl.witold.petcare.auth;

import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pl.witold.petcare.dto.AuthRequest;
import pl.witold.petcare.dto.AuthResponse;
import pl.witold.petcare.dto.RegisterRequest;
import pl.witold.petcare.dto.UserResponseDto;
import pl.witold.petcare.exceptions.FieldIsAlreadyTakenException;
import pl.witold.petcare.exceptions.UserNotFoundException;
import pl.witold.petcare.security.jwt.JwtService;
import pl.witold.petcare.user.Role;
import pl.witold.petcare.user.User;
import pl.witold.petcare.user.UserMapper;
import pl.witold.petcare.user.UserRepository;

import java.util.Set;

/**
 * Implementation of AuthService that handles authentication and registration.
 */
@Service
@RequiredArgsConstructor
@Transactional
public class AuthServiceImpl implements AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public AuthResponse login(AuthRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.username(),
                        request.password()
                )
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);

        UserDetails userDetails = (UserDetails) authentication.getPrincipal();

        String jwt = jwtService.generateToken(userDetails);
        return AuthResponse.bearer(jwt);
    }


    @Override
    public UserResponseDto register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.username())) {
            throw new FieldIsAlreadyTakenException("Username is already taken");
        }
        if (userRepository.existsByEmail(request.email())) {
            throw new FieldIsAlreadyTakenException("Email is already taken");
        }

        User user = new User(
                request.fullName(),
                request.username(),
                request.email(),
                passwordEncoder.encode(request.password()),
                Set.of(Role.USER)
        );

        userRepository.save(user);
        return UserMapper.toDto(user);
    }

    @Override
    public UserResponseDto getCurrentUser(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UserNotFoundException("User not found"));
        return UserMapper.toDto(user);
    }
}
