package com.example.backend.security;

import java.io.IOException;
import java.util.Map;

import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.security.oauth2.core.user.OAuth2User;
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

        // Aceita OIDC ou OAuth2
        Object principal = authentication.getPrincipal();
        Map<String, Object> attrs;
        if (principal instanceof OidcUser oidc) {
            attrs = oidc.getAttributes();
        } else if (principal instanceof OAuth2User oauth2) {
            attrs = oauth2.getAttributes();
        } else {
            writeJson(response, HttpServletResponse.SC_INTERNAL_SERVER_ERROR,
                    Map.of("error", "Unsupported principal type"));
            return;
        }

        final String email = (String) attrs.get("email");

        String tmpName = (String) attrs.get("name");
        if (tmpName == null || tmpName.isBlank()) {
            String given  = (String) attrs.get("given_name");
            String family = (String) attrs.get("family_name");
            tmpName = ((given != null ? given : "") + " " + (family != null ? family : "")).trim();
        }
        final String displayName = (tmpName == null || tmpName.isBlank()) ? email : tmpName;

        // cria usuário se não existir (role como String minúscula)
        User user = userRepository.findByEmail(email).orElseGet(() -> {
            User u = new User();
            u.setEmail(email);
            u.setUsername(displayName);
            u.setPassword("");      // social sem senha local
            u.setRole("user");      // padrão sem prefixo
            return userRepository.save(u);
        });

        // gera JWT
        String token = jwtUtils.generateJwtToken(UserDetailsImpl.build(user));

        writeJson(response, HttpServletResponse.SC_OK, Map.of(
            "message", "Login com Google bem-sucedido",
            "name", user.getUsername(),
            "email", user.getEmail(),
            "role", user.getRole(),  // <- String: "user" | "admin"
            "token", token
        ));
    }

    private void writeJson(HttpServletResponse response, int status, Map<String, Object> body) throws IOException {
        if (!response.isCommitted()) {
            response.setStatus(status);
            response.setContentType("application/json;charset=UTF-8");
            response.getWriter().write(objectMapper.writeValueAsString(body));
        }
    }
}
