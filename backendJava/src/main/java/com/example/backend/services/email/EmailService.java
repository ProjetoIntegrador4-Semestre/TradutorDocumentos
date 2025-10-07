package com.example.backend.services.email;

public interface EmailService {
  void sendPasswordReset(String toEmail, String resetUrl);
}
