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

    private static final Logger logger = LoggerFactory.getLogger(AuthTokenFilter.class);

    private static final AntPathMatcher PATH_MATCHER = new AntPathMatcher();

    private final JwtUtils jwtUtils;

    public AuthTokenFilter(JwtUtils jwtUtils) {
        this.jwtUtils = jwtUtils;
    }

    // Padrões de caminhos públicos (aceita prefixos e curingas)
    // Obs.: usar padrões evita esquecer subpaths (ex.: /swagger-ui/**, /files/** etc.)
    private static final String[] PUBLIC_PATTERNS = {
            "/",                    // home
            "/error",               // erro padrão do Spring
            "/files/**",            // arquivos públicos
            "/api/auth/**",         // login/refresh
            "/api/auth/google/**",  // OAuth flow
            "/h2-console/**",
            "/v3/api-docs/**",
            "/swagger-ui.html",
            "/swagger-ui/**",
            "/swagger-resources/**",
            "/swagger-config/**"
    };

    /**
     * Diz ao Spring quando **não** filtrar:
     * - Preflight CORS (OPTIONS)
     * - Rotas públicas
     */
    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        final String method = request.getMethod();
        if ("OPTIONS".equalsIgnoreCase(method)) return true;

        final String path = getPath(request);
        for (String pattern : PUBLIC_PATTERNS) {
            if (PATH_MATCHER.match(pattern, path)) {
                return true;
            }
        }
        return false;
    }

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request,
                                    @NonNull HttpServletResponse response,
                                    @NonNull FilterChain filterChain) throws ServletException, IOException {

        try {
            // Se já há autenticação estabelecida, apenas segue
            if (SecurityContextHolder.getContext().getAuthentication() != null) {
                filterChain.doFilter(request, response);
                return;
            }

            // Lê o token (se houver)
            String jwt = parseJwt(request);
            if (!StringUtils.hasText(jwt)) {
                // Sem token -> não autentica aqui; Security decidirá mais adiante
                filterChain.doFilter(request, response);
                return;
            }

            // Valida o token; jamais enviar 401 no filtro (deixe o Security/Controller responder)
            if (jwtUtils.validateJwtToken(jwt)) {
                Long   id       = jwtUtils.getUserIdFromJwtToken(jwt);
                String username = jwtUtils.getUserNameFromJwtToken(jwt);
                String email    = jwtUtils.getEmailFromJwtToken(jwt);
                String role     = normalizeRole(jwtUtils.getRoleFromJwtToken(jwt)); // garante ROLE_*

                var authorities = List.of(new SimpleGrantedAuthority(role));
                var userDetails = new UserDetailsImpl(id, username, email, null, role);

                var authentication = new UsernamePasswordAuthenticationToken(userDetails, null, authorities);
                authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                SecurityContextHolder.getContext().setAuthentication(authentication);
                logger.debug("✅ Auth configurada para {} ({} / {}) role={}",
                        getPath(request), username, email, role);
            } else {
                logger.warn("❌ Token inválido/expirado em {}", getPath(request));
            }
        } catch (Exception e) {
            // Nunca interromper o fluxo com 401/500 aqui; deixe seguir.
            logger.error("⚠️ Erro ao processar JWT em {}: {}", getPath(request), e.toString());
        }

        filterChain.doFilter(request, response);
    }

    private String parseJwt(HttpServletRequest request) {
        String headerAuth = request.getHeader("Authorization");
        if (StringUtils.hasText(headerAuth) && headerAuth.startsWith("Bearer ")) {
            return headerAuth.substring(7);
        }
        return null;
    }

    private String normalizeRole(String role) {
        if (!StringUtils.hasText(role)) return "ROLE_USER";
        return role.startsWith("ROLE_") ? role : "ROLE_" + role;
    }

    private String getPath(HttpServletRequest request) {
        // servletPath ignora contextPath; se vazio, caia para requestURI
        String p = request.getServletPath();
        return (StringUtils.hasText(p) ? p : request.getRequestURI());
    }
}
