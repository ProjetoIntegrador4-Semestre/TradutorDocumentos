package com.example.backend.repositories;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.backend.entities.User;

public interface UserRepository extends JpaRepository<User, Long> {
    // Busca simples por username
    Optional<User> findByUsername(String username);

    // Busca simples por email
    Optional<User> findByEmail(String email);
}
