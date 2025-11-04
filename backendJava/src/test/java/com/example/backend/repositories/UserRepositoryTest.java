package com.example.backend.repositories;

import com.example.backend.entities.User;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.ActiveProfiles;

import jakarta.persistence.EntityManager;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@ActiveProfiles("test")
class UserRepositoryTest {

    @Autowired
    private EntityManager em;

    @Autowired
    private UserRepository userRepository; 

    @Test
    @DisplayName("findByEmail deve retornar usuário quando o e-mail existir")
    void findByEmail_returnsUser_whenExists() {
        // arrange
        User u = new User();
        u.setUsername("samuel");
        u.setEmail("samuel@example.com");
        u.setPassword("hash-qualquer");
        u.setRole("user");
        em.persist(u);
        em.flush();
        em.clear(); 

        // act
        Optional<User> found = userRepository.findByEmail("samuel@example.com");

        // assert
        assertThat(found).isPresent();
        assertThat(found.get().getUsername()).isEqualTo("samuel");
        assertThat(found.get().getEmail()).isEqualTo("samuel@example.com");
    }

    @Test
    @DisplayName("findByEmail deve retornar vazio quando o e-mail não existir")
    void findByEmail_returnsEmpty_whenNotFound() {
        // act
        Optional<User> found = userRepository.findByEmail("naoexiste@example.com");

        // assert
        assertThat(found).isEmpty();
    }
}