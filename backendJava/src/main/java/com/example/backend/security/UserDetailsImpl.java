package com.example.backend.security;

import java.util.Collection;
import java.util.List;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import com.example.backend.entities.RoleName;
import com.example.backend.entities.User;

public class UserDetailsImpl implements UserDetails {

    private final Long id;
    // guardamos o "username" de exibição, mas autenticamos por email em getUsername()
    private final String username;
    private final String email;
    private final String password;
    private final RoleName role;   // ENUM

    private final Collection<? extends GrantedAuthority> authorities;

    public UserDetailsImpl(Long id, String username, String email, String password, RoleName role) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.password = password;
        this.role = (role == null ? RoleName.USER : role);

        // Spring Security espera ROLE_*
        String authRole = "ROLE_" + this.role.name();
        this.authorities = List.of(new SimpleGrantedAuthority(authRole));
    }

    public static UserDetailsImpl build(User user) {
        return new UserDetailsImpl(
            user.getId(),
            user.getUsername(),
            user.getEmail(),
            user.getPassword(),
            user.getRole() // RoleName
        );
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() { return authorities; }

    public Long getId() { return id; }

    public String getEmail() { return email; }

    /** Útil para respostas JWT; devolve "USER" ou "ADMIN". */
    public String getRole() { return role.name(); }

    public RoleName getRoleEnum() { return role; }

    @Override public String getPassword() { return password; }

    @Override
    public String getUsername() {
        // identificador de login = email
        return email;
    }

    @Override public boolean isAccountNonExpired() { return true; }
    @Override public boolean isAccountNonLocked() { return true; }
    @Override public boolean isCredentialsNonExpired() { return true; }
    @Override public boolean isEnabled() { return true; }
}
