package com.example.backend.util;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.util.Base64;

public final class Tokens {
  private static final SecureRandom RAND = new SecureRandom();

  private Tokens() {}

  /** Token seguro Base64URL (sem =), 32 bytes ~ 43 chars. */
  public static String newResetToken() {
    byte[] buf = new byte[32];
    RAND.nextBytes(buf);
    return Base64.getUrlEncoder().withoutPadding().encodeToString(buf);
  }

  /** SHA-256 em hex minúsculo (64 chars). */
  public static String sha256Hex(String value) {
    try {
      MessageDigest md = MessageDigest.getInstance("SHA-256");
      byte[] digest = md.digest(value.getBytes(StandardCharsets.UTF_8));
      StringBuilder sb = new StringBuilder(digest.length * 2);
      for (byte b : digest) sb.append(String.format("%02x", b));
      return sb.toString();
    } catch (Exception e) {
      throw new IllegalStateException("SHA-256 indisponível", e);
    }
  }
}
