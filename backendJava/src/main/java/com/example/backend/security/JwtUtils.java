package com.example.backend.security;

import java.util.Date;
import java.util.HashMap;
import java.util.Map;

import javax.crypto.SecretKey;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

@Component
public class JwtUtils {

    @Value("${jwt.secret}")
    private String jwtSecret;

    @Value("${jwt.expiration}")
    private int jwtExpirationMs;

    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(jwtSecret.getBytes());
    }

    /**
     * Overload padrão: mantém compatibilidade.
     * Continua usando o "username" do UserDetailsImpl (geralmente e-mail em muitos apps).
     */
    public String generateJwtToken(UserDetailsImpl userPrincipal) {
        return generateJwtToken(userPrincipal, userPrincipal.getUsername());
    }

    /**
     * Overload preferido: recebe um displayName (ex.: "Bruno Sakamoto (Sakamoto)")
     * e grava em 'username' e 'name' no JWT.
     */
    public String generateJwtToken(UserDetailsImpl userPrincipal, String displayName) {
        final String subjectEmail = userPrincipal.getEmail();

        // Normaliza o displayName (fallback seguro)
        String prettyName = (displayName != null && !displayName.isBlank())
                ? displayName
                : userPrincipal.getUsername(); // último recurso

        Map<String, Object> claims = new HashMap<>();
        claims.put("id", userPrincipal.getId());
        claims.put("email", subjectEmail);
        claims.put("role", userPrincipal.getRole()); // "user" | "admin"
        claims.put("username", prettyName);          // ⬅️ o nome “bonito” vai aqui
        claims.put("name", prettyName);              // ⬅️ duplica em 'name' (front prioriza se existir)

        Date now = new Date();
        Date exp = new Date(now.getTime() + jwtExpirationMs);

        return Jwts.builder()
                .setClaims(claims)
                .setSubject(subjectEmail)     // subject = email (ok manter)
                .setIssuedAt(now)
                .setExpiration(exp)
                .signWith(getSigningKey())
                .compact();
    }

    private Claims getAllClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public String getUserNameFromJwtToken(String token) {
        // mantém compat: lê 'username'; (se quiser, pode ler 'name' e cair para 'username')
        return getAllClaims(token).get("username", String.class);
    }

    public String getEmailFromJwtToken(String token) {
        return getAllClaims(token).get("email", String.class);
    }

    public Long getUserIdFromJwtToken(String token) {
        return getAllClaims(token).get("id", Long.class);
    }

    public String getRoleFromJwtToken(String token) {
        return getAllClaims(token).get("role", String.class);
    }

    public boolean validateJwtToken(String authToken) {
        try {
            Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(authToken);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }
}
