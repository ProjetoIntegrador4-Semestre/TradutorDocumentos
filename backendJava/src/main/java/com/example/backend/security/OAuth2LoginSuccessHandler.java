package com.example.backend.security;

import java.io.IOException;
import java.util.Map;

import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import com.example.backend.entities.User;
import com.example.backend.repositories.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class OAuth2LoginSuccessHandler implements AuthenticationSuccessHandler {

    private final UserRepository userRepository;
    private final JwtUtils jwtUtils;
    private final ObjectMapper objectMapper; // para converter em JSON

    public OAuth2LoginSuccessHandler(UserRepository userRepository, JwtUtils jwtUtils, ObjectMapper objectMapper) {
        this.userRepository = userRepository;
        this.jwtUtils = jwtUtils;
        this.objectMapper = objectMapper;
    }

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication) throws IOException, ServletException {
        var principal = (DefaultOAuth2User) authentication.getPrincipal();
        String email = principal.getAttribute("email");
        String name = principal.getAttribute("name");

        // 🔹 Se não existir no banco, cria
        User user = userRepository.findByEmail(email).orElseGet(() -> {
            User newUser = new User();
            newUser.setEmail(email);
            newUser.setUsername(name);
            newUser.setPassword(""); // não tem senha
            newUser.setRole("ROLE_USER");
            return userRepository.save(newUser);
        });

        // 🔹 Gera JWT
        String token = jwtUtils.generateJwtToken(UserDetailsImpl.build(user));

        // 🔹 Monta resposta JSON
        Map<String, Object> responseBody = Map.of(
            "message", "Login com Google bem-sucedido",
            "name", user.getUsername(),
            "email", user.getEmail(),
            "role", user.getRole(),
            "token", token
        );

        if (!response.isCommitted()) {
            response.setStatus(HttpServletResponse.SC_OK);
            response.setContentType("application/json;charset=UTF-8");
            response.getWriter().write(objectMapper.writeValueAsString(responseBody));
        }
    }
}
