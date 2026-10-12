package com.openshelf.library.auth;

import org.springframework.security.core.userdetails.*;
import org.springframework.stereotype.Service;

@Service
public class CustomUserDetailsService implements UserDetailsService {
    private final UserRepository users;
    public CustomUserDetailsService(UserRepository users) { this.users = users; }

    @Override public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        AppUser user = users.findByEmailIgnoreCase(email)
            .orElseThrow(() -> new UsernameNotFoundException("Invalid email or password"));
        return User.withUsername(user.getEmail()).password(user.getPassword())
            .roles(user.getRole()).disabled(!user.isEnabled()).build();
    }
}