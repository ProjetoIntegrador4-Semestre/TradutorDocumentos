package com.example.backend.controllers;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
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
        var principal = (DefaultOAuth2User) authentication.getPrincipal();
        String email = principal.getAttribute("email");
        String name = principal.getAttribute("name");

        // 🔹 Busca ou cria usuário no banco
        User user = userRepository.findByEmail(email)
                .orElseGet(() -> {
                    User novo = new User();
                    novo.setUsername(name);
                    novo.setEmail(email);
                    novo.setPassword(""); // login social não usa senha
                    novo.setRole("ROLE_USER");
                    return userRepository.save(novo);
                });

        // 🔹 Converte para UserDetailsImpl
        UserDetailsImpl userDetails = UserDetailsImpl.build(user);

        // 🔹 Gera JWT
        String token = jwtUtils.generateJwtToken(userDetails);

        return ResponseEntity.ok(Map.of(
            "message", "Login com Google bem-sucedido",
            "name", name,
            "email", email,
            "token", token
        ));
    }

    // 🚨 Esse callback só atrapalha — pode remover
    // @GetMapping("/callback")
    // public String callback() {
    //     return "Autenticação Google finalizada!";
    // }
}
