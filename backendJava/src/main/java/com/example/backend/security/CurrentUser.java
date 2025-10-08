package com.example.backend.security;

import com.example.backend.entities.User;
import com.example.backend.repositories.UserRepository;
import org.springframework.stereotype.Component;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.nio.charset.StandardCharsets;
import java.util.UUID;

/**
 * Helper estático para obter o userId em UUID.
 * - Se seu User.id for UUID: retorna direto.
 * - Se seu User.id for Long: converte para um UUID determinístico (não muda seu schema).
 */
public final class CurrentUser {
  private static UserRepository users;

  private CurrentUser() {}

  /** Suporte para injetar o UserRepository no helper estático */
  @Component
  static class Injector {
    Injector(UserRepository repo) { CurrentUser.users = repo; }
  }

  public static UUID id() {
    Authentication auth = SecurityContextHolder.getContext().getAuthentication();
    if (auth == null || !auth.isAuthenticated()) {
      throw new IllegalStateException("No authentication");
    }
    String usernameOrEmail = auth.getName();

    User u = users.findByUsername(usernameOrEmail)
        .or(() -> users.findByEmail(usernameOrEmail))
        .orElseThrow(() -> new IllegalStateException("User not found: " + usernameOrEmail));

    Object rawId = u.getId();

    // Caso seu User.id já seja UUID
    if (rawId instanceof UUID uuid) return uuid;

    // Caso seu User.id seja Long -> converter para UUID estável
    if (rawId instanceof Long l) return nameUuidFrom("user:" + l);

    // Se for outro tipo, ajuste aqui conforme seu modelo
    throw new IllegalStateException("Unsupported User.id type: " + (rawId == null ? "null" : rawId.getClass()));
  }

  private static UUID nameUuidFrom(String seed) {
    return UUID.nameUUIDFromBytes(seed.getBytes(StandardCharsets.UTF_8));
  }
}