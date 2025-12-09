package pl.witold.petcare.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import pl.witold.petcare.security.jwt.JwtAuthEntryPoint;
import pl.witold.petcare.security.jwt.JwtAuthFilter;
import pl.witold.petcare.security.jwt.RestAccessDeniedHandler;

import java.util.List;
import java.util.Optional;

@Configuration
@EnableMethodSecurity
@EnableConfigurationProperties(CorsProperties.class)
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;
    private final JwtAuthEntryPoint jwtAuthEntryPoint;
    private final RestAccessDeniedHandler accessDeniedHandler;
    private final CorsProperties corsProperties;
    private final String apiPrefix;

    public SecurityConfig(
            JwtAuthFilter jwtAuthFilter,
            JwtAuthEntryPoint jwtAuthEntryPoint,
            RestAccessDeniedHandler accessDeniedHandler,
            CorsProperties corsProperties,
            @Value("${api.prefix:/api}") String apiPrefix
    ) {
        this.jwtAuthFilter = jwtAuthFilter;
        this.jwtAuthEntryPoint = jwtAuthEntryPoint;
        this.accessDeniedHandler = accessDeniedHandler;
        this.corsProperties = corsProperties;
        this.apiPrefix = apiPrefix;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http,
            AuthenticationProvider authenticationProvider
    ) throws Exception {

        String p = apiPrefix.endsWith("/") ? apiPrefix.substring(0, apiPrefix.length() - 1) : apiPrefix;

        http
                .csrf(AbstractHttpConfigurer::disable)
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .exceptionHandling(ex -> ex
                        .authenticationEntryPoint(jwtAuthEntryPoint)
                        .accessDeniedHandler(accessDeniedHandler)
                )
                .authorizeHttpRequests(auth -> auth
                        // Public authentication endpoints
                        .requestMatchers(p + "/auth/register", p + "/auth/login").permitAll()
                        // Public status/health endpoints
                        .requestMatchers(p + "/status/**").permitAll()
                        // Swagger / OpenAPI documentation
                        .requestMatchers(
                                "/v3/api-docs/**",
                                "/swagger-ui/**",
                                "/swagger-ui.html"
                        ).permitAll()
                        // Admin-only areas
                        .requestMatchers(p + "/users/**").hasRole("ADMIN")
                        .requestMatchers(p + "/admin/**").hasRole("ADMIN")
                        // Vet profile & schedule – only vets can manage their own data
                        .requestMatchers(p + "/vets/me/**").hasAnyRole("VET", "ADMIN")
                        // Vet listing – available for authenticated domain users
                        .requestMatchers(p + "/vets/**").hasAnyRole("USER", "VET", "ADMIN")
                        // Pets API – any authenticated domain role; ownership will be validated in guards
                        .requestMatchers(p + "/pets/**").hasAnyRole("USER", "VET", "ADMIN")
                        // Visits API – authenticated domain roles only
                        .requestMatchers(p + "/visits/**").hasAnyRole("USER", "VET", "ADMIN")
                        // Medical Records API – authenticated domain roles only
                        .requestMatchers(p + "/medical-records/**").hasAnyRole("USER", "VET", "ADMIN")
                        // Everything else does not require authentication
                        .anyRequest().permitAll()
                )
                .authenticationProvider(authenticationProvider)
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)
                .formLogin(AbstractHttpConfigurer::disable)
                .httpBasic(AbstractHttpConfigurer::disable);

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public DaoAuthenticationProvider authenticationProvider(
            UserDetailsService userDetailsService,
            PasswordEncoder encoder
    ) {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider(userDetailsService);
        provider.setPasswordEncoder(encoder);
        return provider;
    }

    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration configuration
    ) throws Exception {
        return configuration.getAuthenticationManager();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();

        // Fallback for local development if property is not set
        List<String> allowedOrigins = Optional.ofNullable(corsProperties.allowedOrigins())
                .filter(list -> !list.isEmpty())
                .orElse(List.of("http://localhost:5173"));

        config.setAllowedOrigins(allowedOrigins);
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
