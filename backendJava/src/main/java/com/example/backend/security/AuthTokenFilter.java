package com.example.backend.security;

import java.io.IOException;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.AntPathMatcher;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class AuthTokenFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(AuthTokenFilter.class);
    private static final AntPathMatcher PATH_MATCHER = new AntPathMatcher();

    private final JwtUtils jwtUtils;

    public AuthTokenFilter(JwtUtils jwtUtils) {
        this.jwtUtils = jwtUtils;
    }

    // ✅ caminhos públicos
    private static final String[] PUBLIC_PATTERNS = {
        "/",
        "/error",
        "/files/**",
        "/api/auth/signin",
        "/api/auth/signup",
        "/api/auth/google/**",
        "/oauth2/**", "/login/oauth2/**",   // ** importante usar /** e não /*
        "/auth/password/**",
        "/h2-console/**",
        "/v3/api-docs/**",
        "/swagger-ui.html",
        "/swagger-ui/**",
        "/swagger-resources/**",
        "/swagger-config/**"
    };

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        // Preflight CORS nunca filtra
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) return true;

        final String path = getPath(request);
        for (String pattern : PUBLIC_PATTERNS) {
            if (PATH_MATCHER.match(pattern, path)) return true;
        }
        return false;
    }

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request,
                                    @NonNull HttpServletResponse response,
                                    @NonNull FilterChain filterChain) throws ServletException, IOException {

        final String path = getPath(request);

        try {
            // Se já existe auth no contexto, segue o fluxo
            if (SecurityContextHolder.getContext().getAuthentication() != null) {
                filterChain.doFilter(request, response);
                return;
            }

            // Para rotas protegidas: validar JWT
            String jwt = parseBearer(request);
            if (!StringUtils.hasText(jwt)) {
                filterChain.doFilter(request, response);
                return;
            }

            if (jwtUtils.validateJwtToken(jwt)) {
                Long   id       = jwtUtils.getUserIdFromJwtToken(jwt);
                String username = jwtUtils.getUserNameFromJwtToken(jwt); // ok se vier null
                String email    = jwtUtils.getEmailFromJwtToken(jwt);
                String roleStr  = normalizeRole(jwtUtils.getRoleFromJwtToken(jwt)); // "user" | "admin"

                var authorities = List.of(new SimpleGrantedAuthority(roleStr));
                var userDetails = new UserDetailsImpl(id, username, email, null, roleStr);

                var authentication = new UsernamePasswordAuthenticationToken(userDetails, null, authorities);
                authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authentication);

                log.debug("✅ JWT ok em {} (email={}) role={}", path, email, roleStr);
            } else {
                log.warn("❌ JWT inválido/expirado em {}", path);
            }

        } catch (Exception e) {
            log.error("⚠️ Erro ao processar token em {}: {}", path, e.toString());
        }

        filterChain.doFilter(request, response);
    }

    private String parseBearer(HttpServletRequest request) {
        String headerAuth = request.getHeader("Authorization");
        if (StringUtils.hasText(headerAuth) && headerAuth.startsWith("Bearer ")) {
            return headerAuth.substring(7).trim();
        }
        return null;
    }

    /** Normaliza para "user"|"admin". Aceita "USER"/"ADMIN" e "ROLE_USER"/"ROLE_ADMIN" legados. */
    private String normalizeRole(String roleClaim) {
        if (!StringUtils.hasText(roleClaim)) return "user";
        String r = roleClaim.trim();
        // remove prefixo ROLE_ se existir
        if (r.regionMatches(true, 0, "ROLE_", 0, 5)) {
            r = r.substring(5);
        }
        r = r.toLowerCase();
        return (r.equals("admin") ? "admin" : "user");
    }

    private String getPath(HttpServletRequest request) {
        String p = request.getServletPath();
        return (StringUtils.hasText(p) ? p : request.getRequestURI());
    }
}
