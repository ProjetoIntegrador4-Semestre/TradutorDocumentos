package com.example.backend.security;

import java.io.IOException;
import java.util.Optional;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import com.example.backend.entities.User;
import com.example.backend.repositories.UserRepository;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class AuthTokenFilter extends OncePerRequestFilter {

    private final JwtUtils jwtUtils;
    private final UserRepository userRepository;

    public AuthTokenFilter(JwtUtils jwtUtils, UserRepository userRepository) {
        this.jwtUtils = jwtUtils;
        this.userRepository = userRepository;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        try {
            String jwt = parseJwt(request);
            if (jwt != null && jwtUtils.validateJwtToken(jwt)) {
                // subject do token é o email (vide JwtUtils.generateJwtToken)
                String email = jwtUtils.getEmailFromJwtToken(jwt);
                if (email == null || email.isBlank()) {
                    // fallback: tenta pelo subject/username, se necessário
                    email = jwtUtils.getUserNameFromJwtToken(jwt);
                }

                if (email != null && !email.isBlank()) {
                    Optional<User> opt = userRepository.findByEmail(email);
                    if (opt.isPresent()) {
                        User user = opt.get();

                        // Se a conta estiver desativada, não autentica
                        if (!user.isEnabled()) {
                            // limpa contexto e segue sem auth
                            SecurityContextHolder.clearContext();
                            filterChain.doFilter(request, response);
                            return;
                        }

                        // Constrói UserDetails a partir do estado atual do banco (role/enable atualizados)
                        UserDetailsImpl userDetails = UserDetailsImpl.build(user);

                        UsernamePasswordAuthenticationToken authentication =
                                new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
                        authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                        SecurityContextHolder.getContext().setAuthentication(authentication);
                    }
                }
            }
        } catch (Exception ex) {
            // Em caso de erro de parsing/validação, não quebra a requisição: segue sem auth
            SecurityContextHolder.clearContext();
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
