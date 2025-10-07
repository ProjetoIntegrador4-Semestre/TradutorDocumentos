package com.example.backend.controllers;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.backend.entities.User;
import com.example.backend.entities.RoleName;
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
        var principal = (DefaultOAuth2User) authentication.getPrincipal();

        final String email = principal.getAttribute("email");

        String tmpName = principal.getAttribute("name");
        if (tmpName == null || tmpName.isBlank()) {
            String given  = principal.getAttribute("given_name");
            String family = principal.getAttribute("family_name");
            tmpName = ((given != null ? given : "") + " " + (family != null ? family : "")).trim();
        }
        if (tmpName == null || tmpName.isBlank()) tmpName = email;
        final String displayName = tmpName;

        User user = userRepository.findByEmail(email).orElseGet(() -> {
            User novo = new User();
            novo.setUsername(displayName);
            novo.setEmail(email);
            novo.setPassword("");        // social não usa senha local
            novo.setRole(RoleName.USER); // <- enum aqui
            return userRepository.save(novo);
        });

        String token = jwtUtils.generateJwtToken(UserDetailsImpl.build(user));

        return ResponseEntity.ok(Map.of(
            "message", "Login com Google bem-sucedido",
            "name", user.getUsername(),
            "email", user.getEmail(),
            "role", user.getRole().name(), // "USER" | "ADMIN"
            "token", token
        ));
    }
}
