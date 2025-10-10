package com.example.backend.security;

import java.io.IOException;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.AntPathMatcher;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import com.example.backend.entities.RoleName;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class AuthTokenFilter extends OncePerRequestFilter {

    private static final Logger logger = LoggerFactory.getLogger(AuthTokenFilter.class);
    private static final AntPathMatcher PATH_MATCHER = new AntPathMatcher();

    private final JwtUtils jwtUtils;

    public AuthTokenFilter(JwtUtils jwtUtils) {
        this.jwtUtils = jwtUtils;
    }

    // ⚠️ BOOT TOKEN (apenas para /api/auth/signin)
    @Value("${APP_BOOT_TOKEN:}")
    private String appBootToken;

    // caminhos públicos — *NÃO* inclua /api/auth/signin aqui!
    private static final String[] PUBLIC_PATTERNS = {
        "/",
        "/error",
        "/files/**",
        "/api/auth/signup",       // cadastro livre
        "/api/auth/google/**",
        "/oauth2/*", "/login/oauth2/*",
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
        // /api/auth/signin NÃO é público -> precisa filtrar aqui
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

            // -------------------------
            // 1) /api/auth/signin → exige BOOT_TOKEN
            // -------------------------
            if (PATH_MATCHER.match("/api/auth/signin", path)) {
                String boot = parseBearer(request);
                if (!StringUtils.hasText(appBootToken) || !StringUtils.hasText(boot) || !boot.equals(appBootToken)) {
                    logger.warn("❌ BOOT_TOKEN ausente/ inválido em {}", path);
                    response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                    return;
                }

                // Autenticação técnica (ROLE_BOOT) apenas para destravar o endpoint de login
                var auth = new UsernamePasswordAuthenticationToken(
                        "boot@app", null, List.of(new SimpleGrantedAuthority("ROLE_BOOT")));
                auth.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(auth);

                filterChain.doFilter(request, response);
                return;
            }

            // -------------------------
            // 2) Demais rotas protegidas → validar JWT do usuário (fluxo normal)
            // -------------------------
            String jwt = parseBearer(request);
            if (!StringUtils.hasText(jwt)) {
                // sem Authorization -> SecurityEntryPoint (401) cuidará adiante
                filterChain.doFilter(request, response);
                return;
            }

            if (jwtUtils.validateJwtToken(jwt)) {
                Long   id       = jwtUtils.getUserIdFromJwtToken(jwt);
                String username = jwtUtils.getUserNameFromJwtToken(jwt); // pode ser null
                String email    = jwtUtils.getEmailFromJwtToken(jwt);
                String roleStr  = jwtUtils.getRoleFromJwtToken(jwt);     // "USER" / "ROLE_USER"

                RoleName roleEnum = toRoleEnum(roleStr);

                var authorities = List.of(new SimpleGrantedAuthority("ROLE_" + roleEnum.name()));
                var userDetails = new UserDetailsImpl(id, username, email, null, roleEnum);

                var authentication = new UsernamePasswordAuthenticationToken(userDetails, null, authorities);
                authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authentication);

                logger.debug("✅ JWT ok em {} (email={}) role={}", path, email, roleEnum.name());
            } else {
                logger.warn("❌ JWT inválido/expirado em {}", path);
            }

        } catch (Exception e) {
            logger.error("⚠️ Erro ao processar token em {}: {}", path, e.toString());
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

    /** Aceita "USER", "ADMIN", "ROLE_USER", "ROLE_ADMIN". Default: USER */
    private RoleName toRoleEnum(String roleClaim) {
        if (!StringUtils.hasText(roleClaim)) return RoleName.USER;
        String r = roleClaim.trim().toUpperCase();
        if (r.startsWith("ROLE_")) r = r.substring(5);
        try {
            return RoleName.valueOf(r);
        } catch (IllegalArgumentException ex) {
            return RoleName.USER;
        }
    }

    private String getPath(HttpServletRequest request) {
        String p = request.getServletPath();
        return (StringUtils.hasText(p) ? p : request.getRequestURI());
    }
}