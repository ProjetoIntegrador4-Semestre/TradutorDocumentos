package com.example.backend.security;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

import javax.crypto.SecretKey;

class JwtUtilsTest {

    private JwtUtils jwtUtils;
    private static final String TEST_SECRET = "IntrMvLCt0wNl8AhgqtP017Y5vkvh4WgfLfsULHhN2MFAhjWcbKD5BXikOF7mf85";
    private static final int TEST_EXPIRATION_MS = 3600000; // 1 hora

    @BeforeEach
    void setUp() {
        jwtUtils = new JwtUtils();
        // Injeta as propriedades de teste via reflexão
        ReflectionTestUtils.setField(jwtUtils, "jwtSecret", TEST_SECRET);
        ReflectionTestUtils.setField(jwtUtils, "jwtExpirationMs", TEST_EXPIRATION_MS);
    }

    @Test
    @DisplayName("generateJwtToken deve retornar token com todos os claims corretos")
    void generateJwtToken_returnsTokenWithAllClaims() {
        // arrange
        UserDetailsImpl userDetails = new UserDetailsImpl(
            1L,
            "samuel",
            "samuel@example.com",
            null,
            "user"
        );

        // act
        String token = jwtUtils.generateJwtToken(userDetails);

        // assert
        assertThat(token).isNotBlank();
        
        // Valida o token
        assertThat(jwtUtils.validateJwtToken(token)).isTrue();
        
        // Extrai e verifica cada claim
        assertThat(jwtUtils.getUserIdFromJwtToken(token)).isEqualTo(1L);
        // Nota: getUserNameFromJwtToken retorna o claim "username", que é preenchido com email no generateJwtToken
        assertThat(jwtUtils.getUserNameFromJwtToken(token)).isEqualTo("samuel@example.com");
        assertThat(jwtUtils.getEmailFromJwtToken(token)).isEqualTo("samuel@example.com");
        assertThat(jwtUtils.getRoleFromJwtToken(token)).isEqualTo("user");
    }

    @Test
    @DisplayName("getUserIdFromJwtToken deve extrair o ID correto do token")
    void getUserIdFromJwtToken_returnsCorrectId() {
        // arrange
        UserDetailsImpl userDetails = new UserDetailsImpl(
            42L,
            "john",
            "john@example.com",
            null,
            "admin"
        );
        String token = jwtUtils.generateJwtToken(userDetails);

        // act
        Long userId = jwtUtils.getUserIdFromJwtToken(token);

        // assert
        assertThat(userId).isEqualTo(42L);
    }

    @Test
    @DisplayName("getEmailFromJwtToken deve extrair o email correto do token")
    void getEmailFromJwtToken_returnsCorrectEmail() {
        // arrange
        UserDetailsImpl userDetails = new UserDetailsImpl(
            1L,
            "test",
            "test@domain.com",
            null,
            "user"
        );
        String token = jwtUtils.generateJwtToken(userDetails);

        // act
        String email = jwtUtils.getEmailFromJwtToken(token);

        // assert
        assertThat(email).isEqualTo("test@domain.com");
    }

    @Test
    @DisplayName("getRoleFromJwtToken deve extrair o role correto do token")
    void getRoleFromJwtToken_returnsCorrectRole() {
        // arrange
        UserDetailsImpl userDetailsAdmin = new UserDetailsImpl(
            1L,
            "admin_user",
            "admin@example.com",
            null,
            "admin"
        );
        String tokenAdmin = jwtUtils.generateJwtToken(userDetailsAdmin);

        UserDetailsImpl userDetailsUser = new UserDetailsImpl(
            2L,
            "normal_user",
            "user@example.com",
            null,
            "user"
        );
        String tokenUser = jwtUtils.generateJwtToken(userDetailsUser);

        // act & assert
        assertThat(jwtUtils.getRoleFromJwtToken(tokenAdmin)).isEqualTo("admin");
        assertThat(jwtUtils.getRoleFromJwtToken(tokenUser)).isEqualTo("user");
    }

    @Test
    @DisplayName("validateJwtToken deve retornar true para token válido e não-expirado")
    void validateJwtToken_returnsTrue_forValidToken() {
        // arrange
        UserDetailsImpl userDetails = new UserDetailsImpl(
            1L,
            "samuel",
            "samuel@example.com",
            null,
            "user"
        );
        String token = jwtUtils.generateJwtToken(userDetails);

        // act
        boolean isValid = jwtUtils.validateJwtToken(token);

        // assert
        assertThat(isValid).isTrue();
    }

    @Test
    @DisplayName("validateJwtToken deve retornar false para token malformado")
    void validateJwtToken_returnsFalse_forMalformedToken() {
        // arrange
        String malformedToken = "definitely.not.a.valid.jwt.token";

        // act
        boolean isValid = jwtUtils.validateJwtToken(malformedToken);

        // assert
        assertThat(isValid).isFalse();
    }

    @Test
    @DisplayName("validateJwtToken deve retornar false para token com signature inválida")
    void validateJwtToken_returnsFalse_forTamperedToken() {
        // arrange
        UserDetailsImpl userDetails = new UserDetailsImpl(
            1L,
            "samuel",
            "samuel@example.com",
            null,
            "user"
        );
        String validToken = jwtUtils.generateJwtToken(userDetails);
        
        // Altera a última parte (signature) do token
        String tamperedToken = validToken.substring(0, validToken.length() - 5) + "XXXXX";

        // act
        boolean isValid = jwtUtils.validateJwtToken(tamperedToken);

        // assert
        assertThat(isValid).isFalse();
    }

    @Test
    @DisplayName("validateJwtToken deve retornar false para null ou string vazia")
    void validateJwtToken_returnsFalse_forNullOrEmpty() {
        // act & assert
        assertThat(jwtUtils.validateJwtToken(null)).isFalse();
        assertThat(jwtUtils.validateJwtToken("")).isFalse();
        assertThat(jwtUtils.validateJwtToken("   ")).isFalse();
    }

    @Test
    @DisplayName("generateJwtToken com role null resulta em 'user' (normalizacao da classe)")
    void generateJwtToken_withNullRole_convertsToUser() {
        // arrange
        UserDetailsImpl userDetails = new UserDetailsImpl(
            5L,
            "test_user",
            "test@example.com",
            null,
            null // role nula
        );

        // act
        String token = jwtUtils.generateJwtToken(userDetails);

        // assert
        assertThat(jwtUtils.validateJwtToken(token)).isTrue();
        // UserDetailsImpl parece converter null para "user" na construção, ou o campo tem default
        // Comportamento observado: quando role é null, token tem "user"
        assertThat(jwtUtils.getRoleFromJwtToken(token)).isEqualTo("user");
    }

    @Test
    @DisplayName("Token gerado deve ser válido quando chamado múltiplas vezes")
    void generateJwtToken_multipleCallsProduceValidTokens() {
        // arrange
        UserDetailsImpl userDetails = new UserDetailsImpl(
            1L,
            "samuel",
            "samuel@example.com",
            null,
            "user"
        );

        // act
        String token1 = jwtUtils.generateJwtToken(userDetails);
        String token2 = jwtUtils.generateJwtToken(userDetails);

        // assert - ambos devem ser válidos (timestamps podem ser iguais se gerados no mesmo milissegundo)
        assertThat(jwtUtils.validateJwtToken(token1)).isTrue();
        assertThat(jwtUtils.validateJwtToken(token2)).isTrue();
        // Podemos ter tokens iguais se gerados instantaneamente
        assertThat(token1).isNotBlank();
        assertThat(token2).isNotBlank();
    }

    @Test
    @DisplayName("getUserNameFromJwtToken deve retornar o claim 'username' do token (que contém email)")
    void getUserNameFromJwtToken_returnsUsernameClaimFromToken() {
        // arrange
        // Nota: generateJwtToken salva email no claim "username"
        UserDetailsImpl userDetails = new UserDetailsImpl(
            1L,
            "john_doe",
            "john@example.com",
            null,
            "user"
        );
        String token = jwtUtils.generateJwtToken(userDetails);

        // act
        String username = jwtUtils.getUserNameFromJwtToken(token);

        // assert - retorna o email (pois generateJwtToken usa email como claim "username")
        assertThat(username).isEqualTo("john@example.com");
    }
}
