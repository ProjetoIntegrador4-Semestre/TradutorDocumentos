package com.example.backend.security;

import java.io.IOException;
import java.util.Map;

import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import com.example.backend.entities.User;
import com.example.backend.entities.RoleName;
import com.example.backend.repositories.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class OAuth2LoginSuccessHandler implements AuthenticationSuccessHandler {

    private final UserRepository userRepository;
    private final JwtUtils jwtUtils;
    private final ObjectMapper objectMapper;

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

        final String email = principal.getAttribute("email");

        String tmpName = principal.getAttribute("name");
        if (tmpName == null || tmpName.isBlank()) {
            String given  = principal.getAttribute("given_name");
            String family = principal.getAttribute("family_name");
            tmpName = ((given != null ? given : "") + " " + (family != null ? family : "")).trim();
        }
        if (tmpName == null || tmpName.isBlank()) {
            tmpName = email; // fallback
        }
        final String displayName = tmpName; // <- final para usar no lambda

        // cria usuário se não existir
        User user = userRepository.findByEmail(email).orElseGet(() -> {
            User u = new User();
            u.setEmail(email);
            u.setUsername(displayName);
            u.setPassword("");           // sem senha local
            u.setRole(RoleName.USER);    // enum
            return userRepository.save(u);
        });

        // gera JWT
        String token = jwtUtils.generateJwtToken(UserDetailsImpl.build(user));

        Map<String, Object> body = Map.of(
            "message", "Login com Google bem-sucedido",
            "name", user.getUsername(),
            "email", user.getEmail(),
            "role", user.getRole().name(),
            "token", token
        );

        if (!response.isCommitted()) {
            response.setStatus(HttpServletResponse.SC_OK);
            response.setContentType("application/json;charset=UTF-8");
            response.getWriter().write(objectMapper.writeValueAsString(body));
        }
    }
}
