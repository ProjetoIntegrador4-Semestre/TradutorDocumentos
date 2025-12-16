package com.example.backend.security;

import java.io.IOException;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import com.example.backend.entities.User;
import com.example.backend.repositories.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class OAuth2LoginSuccessHandler implements AuthenticationSuccessHandler {

    private final UserRepository userRepository;
    private final JwtUtils jwtUtils;
    private final ObjectMapper objectMapper;

    private final String frontendCallback;

    public OAuth2LoginSuccessHandler(
            UserRepository userRepository,
            JwtUtils jwtUtils,
            ObjectMapper objectMapper,
            @Value("${app.oauth2.redirect-uri:}") String frontendCallback) {
        this.userRepository = userRepository;
        this.jwtUtils = jwtUtils;
        this.objectMapper = objectMapper;
        this.frontendCallback = frontendCallback;
    }

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
            HttpServletResponse response,
            Authentication authentication) throws IOException {

        Map<String, Object> attrs;
        Object principal = authentication.getPrincipal();
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
            String given = (String) attrs.get("given_name");
            String family = (String) attrs.get("family_name");
            tmpName = ((given != null ? given : "") + " " + (family != null ? family : "")).trim();
        }
        final String displayName = (tmpName == null || tmpName.isBlank()) ? email : tmpName;

        User user = userRepository.findByEmail(email).orElseGet(() -> {
            User u = new User();
            u.setEmail(email);
            u.setUsername(displayName);
            u.setPassword("");
            u.setRole("user");
            return userRepository.save(u);
        });

        String token = jwtUtils.generateJwtToken(UserDetailsImpl.build(user), user.getUsername());

        String finalRedirectUri = request.getParameter("redirect_uri");

        if (finalRedirectUri == null || finalRedirectUri.isBlank()) {
            finalRedirectUri = this.frontendCallback;
        }

        if (finalRedirectUri != null && !finalRedirectUri.isBlank()) {
            String target = UriComponentsBuilder
                    .fromUriString(finalRedirectUri)
                    .queryParam("token", token)
                    .build()
                    .toUriString();

            response.sendRedirect(target);
            return;
        }

        writeJson(response, HttpServletResponse.SC_OK, Map.of(
                "message", "Login com Google bem-sucedido",
                "name", user.getUsername(),
                "email", user.getEmail(),
                "role", user.getRole(),
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
