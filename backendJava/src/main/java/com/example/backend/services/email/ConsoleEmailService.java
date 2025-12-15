package com.example.backend.services.email;

import org.springframework.stereotype.Service;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
public class ConsoleEmailService implements EmailService {
  @Override
  public void sendPasswordReset(String toEmail, String resetUrl) {
    log.info("📧 Reset de senha para {} -> {}", toEmail, resetUrl);
  }
}
