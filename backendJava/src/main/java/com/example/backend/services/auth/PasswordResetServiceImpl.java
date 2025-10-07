package com.example.backend.services.auth;

import java.time.Duration;
import java.time.Instant;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.example.backend.dto.auth.ForgotPasswordRequest;
import com.example.backend.dto.auth.ResetPasswordRequest;
import com.example.backend.entities.PasswordResetToken;
import com.example.backend.entities.User;
import com.example.backend.repositories.PasswordResetTokenRepository;
import com.example.backend.repositories.UserRepository;
import com.example.backend.services.email.EmailService;
import com.example.backend.util.Tokens;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PasswordResetServiceImpl implements PasswordResetService {

  private final UserRepository userRepo;
  private final PasswordResetTokenRepository tokenRepo;
  private final EmailService emailService;
  private final PasswordEncoder passwordEncoder;

  @Value("${app.reset.expMinutes:30}")
  private long expMinutes;

  @Value("${app.frontend.reset-path:/reset-password}") // ex.: "/reset-password"
  private String frontendResetPath;

  @Override
  public void startReset(ForgotPasswordRequest req, String appBaseUrl) {
    // Passo 1: procurar usuário (responder 200 mesmo se não existir p/ não vazar emails)
    Optional<User> maybeUser = userRepo.findByEmail(req.email());
    if (maybeUser.isEmpty()) {
      return;
    }
    User user = maybeUser.get();

    // Throttle simples: se já existe um token válido, não criar outro
    boolean hasValid = tokenRepo.existsByUserAndUsedFalseAndExpiresAtAfter(user, Instant.now());
    if (hasValid) {
      return;
    }

    // Passo 2: gerar token e salvar hash
    String token = Tokens.newResetToken();
    String tokenHash = Tokens.sha256Hex(token);

    Instant expiresAt = Instant.now().plus(Duration.ofMinutes(expMinutes));
    PasswordResetToken prt = PasswordResetToken.builder()
        .user(user)
        .tokenHash(tokenHash)
        .expiresAt(expiresAt)
        .used(false)
        .build();
    tokenRepo.save(prt);

    // Passo 3: compor URL que o FRONT vai abrir (ele só envia token de volta ao backend)
    // appBaseUrl = http(s)://host:8080 (ou via config). O path é do FRONT.
    String resetUrl = appBaseUrl + frontendResetPath + "?token=" + token;

    // Passo 4: “enviar e-mail”
    emailService.sendPasswordReset(user.getEmail(), resetUrl);
  }

  @Override
  public void finishReset(ResetPasswordRequest req) {
    String tokenHash = Tokens.sha256Hex(req.token());
    PasswordResetToken token = tokenRepo
        .findByTokenHashAndUsedFalseAndExpiresAtAfter(tokenHash, Instant.now())
        .orElseThrow(() -> new IllegalArgumentException("Token inválido ou expirado"));

    User user = token.getUser();

    // Atualiza senha
    user.setPassword(passwordEncoder.encode(req.newPassword()));
    userRepo.save(user);

    // Marca token como usado
    token.setUsed(true);
    tokenRepo.save(token);

    // (opcional) invalida outros tokens antigos do usuário
    tokenRepo.deleteByUserAndExpiresAtBefore(user, Instant.now());
  }
}
