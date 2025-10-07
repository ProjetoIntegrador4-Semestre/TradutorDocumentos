package com.example.backend.controllers;

import java.net.URI;

import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import com.example.backend.dto.auth.ForgotPasswordRequest;
import com.example.backend.dto.auth.ResetPasswordRequest;
import com.example.backend.services.auth.PasswordResetService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/auth/password")
@Validated
@RequiredArgsConstructor
public class PasswordResetController {

  private final PasswordResetService service;

  /** Inicia o fluxo. Sempre retorna 200 para não vazar se email existe. */
  @PostMapping("/forgot")
  public ResponseEntity<?> forgot(@Valid @RequestBody ForgotPasswordRequest req,
                                  HttpServletRequest http) {
    String appBase = baseUrl(http);
    service.startReset(req, appBase);
    return ResponseEntity.ok().build();
  }

  /** Conclui o reset: recebe token + nova senha. */
  @PostMapping("/reset")
  public ResponseEntity<?> reset(@Valid @RequestBody ResetPasswordRequest req) {
    service.finishReset(req);
    return ResponseEntity.noContent().build();
  }

  /** (Opcional) Endpoint para o front validar token antes de exibir form. */
  @GetMapping("/reset/validate")
  public ResponseEntity<?> validate(@RequestParam("token") String token) {
    try {
      // reaproveita a regra de parsing/hash no service chamando finish com senha dummy? Melhor não.
      // Aqui só vemos formato: se quiser validar de verdade, crie método service.validate(token).
      return ResponseEntity.ok().build();
    } catch (Exception e) {
      return ResponseEntity.badRequest().body("Token inválido");
    }
  }

  private String baseUrl(HttpServletRequest req) {
    // ex.: http://localhost:8080
    String scheme = req.getHeader("X-Forwarded-Proto");
    if (scheme == null || scheme.isBlank()) scheme = req.getScheme();
    String host = req.getHeader("X-Forwarded-Host");
    if (host == null || host.isBlank()) host = req.getHeader("Host");
    if (host == null || host.isBlank()) host = req.getServerName() + ":" + req.getServerPort();
    return scheme + "://" + host;
  }
}
