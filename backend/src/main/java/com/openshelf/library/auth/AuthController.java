package com.openshelf.library.auth;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final UserRepository users;
    private final PasswordEncoder encoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    public AuthController(UserRepository users, PasswordEncoder encoder,
                          AuthenticationManager authenticationManager, JwtService jwtService) {
        this.users = users; this.encoder = encoder; this.authenticationManager = authenticationManager; this.jwtService = jwtService;
    }

    public record RegisterRequest(@NotBlank @Size(min=2, max=100) String name,
                                  @NotBlank @Email String email,
                                  @NotBlank @Size(min=8, max=72) String password) {}
    public record LoginRequest(@NotBlank @Email String email, @NotBlank String password) {}

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public Map<String, Object> register(@Valid @RequestBody RegisterRequest request) {
        String email = request.email().trim().toLowerCase();
        if (users.existsByEmailIgnoreCase(email)) throw new ResponseStatusException(HttpStatus.CONFLICT, "Email is already registered");
        AppUser user = new AppUser();
        user.setName(request.name().trim()); user.setEmail(email); user.setPassword(encoder.encode(request.password()));
        user.setRole("USER"); user.setEnabled(true);
        return response(users.save(user));
    }

    @PostMapping("/login")
    public Map<String, Object> login(@Valid @RequestBody LoginRequest request) {
        try { authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(request.email().trim().toLowerCase(), request.password())); }
        catch (AuthenticationException ex) { throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid email or password"); }
        AppUser user = users.findByEmailIgnoreCase(request.email().trim()).orElseThrow();
        return response(user);
    }

    private Map<String, Object> response(AppUser user) {
        return Map.of("token", jwtService.generate(user.getEmail(), user.getRole()),
            "user", Map.of("id", user.getId(), "name", user.getName(), "email", user.getEmail(), "role", user.getRole()));
    }
}