package com.example.backend.security;

import java.util.Collection;
import java.util.List;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import com.example.backend.entities.User;

public class UserDetailsImpl implements UserDetails {

    private final Long id;
    private final String username;
    private final String email;
    private final String password;
    private final String role; // "user" | "admin"
    private final Collection<? extends GrantedAuthority> authorities;

    public UserDetailsImpl(Long id, String username, String email, String password, String role) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.password = password;
        this.role = (role == null ? "user" : role.toLowerCase());
        // <<< sem prefixo
        this.authorities = List.of(new SimpleGrantedAuthority(this.role));
    }

    public static UserDetailsImpl build(User u) {
        return new UserDetailsImpl(
            u.getId(),
            u.getUsername(),
            u.getEmail(),
            u.getPassword(),
            u.getRole()
        );
    }

    @Override public Collection<? extends GrantedAuthority> getAuthorities() { return authorities; }
    public Long getId() { return id; }
    public String getEmail() { return email; }
    public String getRole() { return role; }
    @Override public String getPassword() { return password; }
    @Override public String getUsername() { return email; }
    @Override public boolean isAccountNonExpired() { return true; }
    @Override public boolean isAccountNonLocked() { return true; }
    @Override public boolean isCredentialsNonExpired() { return true; }
    @Override public boolean isEnabled() { return true; }
}
