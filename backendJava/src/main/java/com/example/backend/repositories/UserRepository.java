package com.example.backend.repositories;

import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import com.example.backend.entities.User;

public interface UserRepository extends JpaRepository<User, Long> {

    // Login por e-mail (recomendado)
    Optional<User> findByEmail(String email);

    // Para compatibilidade com AuthController que usa findByUsername(...)
    Optional<User> findByUsername(String username);

    // Útil caso queira tratar login sem case sensitivity
    Optional<User> findByUsernameIgnoreCase(String username);

    // Busca paginada para a tela/admin
    Page<User> findByUsernameContainingIgnoreCaseOrEmailContainingIgnoreCase(
        String username, String email, Pageable pageable
    );
}
