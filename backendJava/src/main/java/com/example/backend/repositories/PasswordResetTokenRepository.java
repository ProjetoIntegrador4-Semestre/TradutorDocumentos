package com.example.backend.repositories;

import java.time.Instant;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.backend.entities.PasswordResetToken;
import com.example.backend.entities.User;

public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, Long> {

  Optional<PasswordResetToken> findByTokenHashAndUsedFalseAndExpiresAtAfter(String tokenHash, Instant now);

  long deleteByUserAndExpiresAtBefore(User user, Instant now);

  boolean existsByUserAndUsedFalseAndExpiresAtAfter(User user, Instant now);
}
