package com.example.backend;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;

@SpringBootTest
@ActiveProfiles("test")
@TestPropertySource(properties = {
    "spring.datasource.url=jdbc:postgresql://localhost:5432/translator",
    "spring.datasource.username=app",
    "spring.datasource.password=app",
    "spring.jpa.hibernate.ddl-auto=create-drop",
    "spring.flyway.enabled=false",
    "spring.security.oauth2.client.registration.google.client-id=test-client-id",
    "spring.security.oauth2.client.registration.google.client-secret=test-client-secret",
    "jwt.secret=test-jwt-secret-for-testing-purposes-only",
    "libre.base-url=http://localhost:5000"
})
class AuthserverApplicationTests {

    @Test
    void contextLoads() {
        // Este teste verifica se o contexto do Spring carrega corretamente
    }

}