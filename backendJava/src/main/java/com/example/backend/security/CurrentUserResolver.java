package com.example.backend.security;

import com.example.backend.repositories.UserRepository;
import com.example.backend.entities.User; // ajuste se seu pacote for outro
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class CurrentUserResolver {

  private final UserRepository users;

  public UUID id() {
    Authentication auth = SecurityContextHolder.getContext().getAuthentication();
    if (auth == null || !auth.isAuthenticated()) {
      throw new IllegalStateException("No authentication");
    }
    String usernameOrEmail = auth.getName();

    User u = users.findByUsername(usernameOrEmail)
        .or(() -> users.findByEmail(usernameOrEmail))
        .orElseThrow(() -> new IllegalStateException("User not found: " + usernameOrEmail));

    // Seu User.id é Long -> convertemos para um UUID determinístico
    return userLongIdToUuid(u.getId());
  }

  // Converte Long (ex.: 42) em um UUID estável (sempre igual para o mesmo Long)
  public static UUID userLongIdToUuid(Long userId) {
    String seed = "user:" + userId; // prefixo pra evitar colisão acidental
    return UUID.nameUUIDFromBytes(seed.getBytes(StandardCharsets.UTF_8));
  }
}
