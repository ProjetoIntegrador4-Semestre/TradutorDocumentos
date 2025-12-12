package com.example.backend.controllers;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.backend.entities.User;
import com.example.backend.repositories.UserRepository;
import com.example.backend.security.JwtUtils;
import com.example.backend.security.UserDetailsImpl;

@RestController
@RequestMapping("/api/auth/google")
public class GoogleAuthController {

    private final JwtUtils jwtUtils;
    private final UserRepository userRepository;

    public GoogleAuthController(JwtUtils jwtUtils, UserRepository userRepository) {
        this.jwtUtils = jwtUtils;
        this.userRepository = userRepository;
    }

    @GetMapping("/success")
    public ResponseEntity<?> success(Authentication authentication) {
        String email;
        String displayName;

        Object p = authentication.getPrincipal();
        Map<String, Object> attrs;

        if (p instanceof OidcUser oidc) {
            attrs = oidc.getAttributes();
        } else if (p instanceof OAuth2User oauth2) {
            attrs = oauth2.getAttributes();
        } else {
            return ResponseEntity.status(500).body(Map.of("error", "Unsupported principal type"));
        }

        email = (String) attrs.get("email");
        String tmpName = (String) attrs.get("name");
        if (tmpName == null || tmpName.isBlank()) {
            String given  = (String) attrs.get("given_name");
            String family = (String) attrs.get("family_name");
            tmpName = ((given != null ? given : "") + " " + (family != null ? family : "")).trim();
        }
        displayName = (tmpName == null || tmpName.isBlank()) ? email : tmpName;

        User user = userRepository.findByEmail(email).orElseGet(() -> {
            User novo = new User();
            novo.setUsername(displayName);
            novo.setEmail(email);
            novo.setPassword("");   // social sem senha local
            novo.setRole("user");   // padrão sem prefixo
            return userRepository.save(novo);
        });

        String token = jwtUtils.generateJwtToken(UserDetailsImpl.build(user));

        return ResponseEntity.ok(Map.of(
            "message", "Login com Google bem-sucedido",
            "name", user.getUsername(),
            "email", user.getEmail(),
            "role", user.getRole(), // <- String ("user" | "admin")
            "token", token
        ));
    }
}
