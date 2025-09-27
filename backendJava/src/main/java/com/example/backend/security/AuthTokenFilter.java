package com.example.backend.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Component
public class AuthTokenFilter extends OncePerRequestFilter {

    private static final Logger logger = LoggerFactory.getLogger(AuthTokenFilter.class);

    @Autowired
    private JwtUtils jwtUtils;

    // Endpoints que não precisam de autenticação
    private static final Set<String> PUBLIC_PATHS = Set.of(
            "/api/auth", "/swagger-ui", "/v3/api-docs",
            "/swagger-resources", "/swagger-config",
            "/h2-console", "/files"
    );

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request,
                                    @NonNull HttpServletResponse response,
                                    @NonNull FilterChain filterChain) throws ServletException, IOException {

        String path = request.getServletPath();

        // Libera os caminhos públicos (sem JWT)
        if (PUBLIC_PATHS.stream().anyMatch(path::startsWith)) {
            filterChain.doFilter(request, response);
            return;
        }

        try {
            String jwt = parseJwt(request);
            if (jwt == null) {
                logger.warn("🚫 Nenhum token encontrado no header Authorization para {}", path);
            } else {
                logger.info("🔑 JWT recebido: {}", jwt);
                if (jwtUtils.validateJwtToken(jwt)) {
                    Long id = jwtUtils.getUserIdFromJwtToken(jwt);
                    String username = jwtUtils.getUserNameFromJwtToken(jwt);
                    String email = jwtUtils.getEmailFromJwtToken(jwt);
                    List<String> roles = jwtUtils.getRolesFromJwtToken(jwt);

                    List<SimpleGrantedAuthority> authorities = roles.stream()
                            .map(SimpleGrantedAuthority::new)
                            .collect(Collectors.toList());

                    UserDetailsImpl userDetails = new UserDetailsImpl(id, username, email, null, authorities);

                    UsernamePasswordAuthenticationToken authentication =
                            new UsernamePasswordAuthenticationToken(userDetails, null, authorities);
                    authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                    SecurityContextHolder.getContext().setAuthentication(authentication);

                    logger.debug("✅ Autenticação configurada para usuário {} (roles: {})", email, roles);
                } else {
                    logger.warn("❌ Token inválido ou expirado para {}", path);
                }
            }
        } catch (Exception e) {
            logger.error("⚠️ Erro ao processar autenticação para {}", path, e);
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
}
