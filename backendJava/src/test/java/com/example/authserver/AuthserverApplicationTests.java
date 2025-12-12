package com.example.authserver;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

import com.example.backend.AuthserverApplication;

// IMPORTANTE: Adiciona a declaração explícita da classe de configuração
@SpringBootTest(classes = AuthserverApplication.class)
class AuthserverApplicationTests {

    @Test
    void contextLoads() {
    }

}