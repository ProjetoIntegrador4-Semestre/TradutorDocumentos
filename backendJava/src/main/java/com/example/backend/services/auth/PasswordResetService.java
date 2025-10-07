package com.example.backend.services.auth;

import com.example.backend.dto.auth.ForgotPasswordRequest;
import com.example.backend.dto.auth.ResetPasswordRequest;

public interface PasswordResetService {
  void startReset(ForgotPasswordRequest req, String appBaseUrl);
  void finishReset(ResetPasswordRequest req);
}
