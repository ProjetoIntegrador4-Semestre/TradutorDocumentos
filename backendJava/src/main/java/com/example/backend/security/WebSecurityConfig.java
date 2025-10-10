package com.example.backend.security;

import java.util.List;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.HttpStatusEntryPoint;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
// (não usar AntPathRequestMatcher)
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
@EnableMethodSecurity(prePostEnabled = true)
public class WebSecurityConfig {

    private final UserDetailsServiceImpl userDetailsService;
    private final OAuth2LoginSuccessHandler oAuth2LoginSuccessHandler;

    public WebSecurityConfig(UserDetailsServiceImpl userDetailsService,
     OAuth2LoginSuccessHandler oAuth2LoginSuccessHandler) {
        this.userDetailsService = userDetailsService;
        this.oAuth2LoginSuccessHandler = oAuth2LoginSuccessHandler;
    }

    @Bean
    public DaoAuthenticationProvider authenticationProvider(PasswordEncoder passwordEncoder) {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder);
        return authProvider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration cfg = new CorsConfiguration();
        cfg.setAllowedOrigins(List.of(
            "http://localhost:8080",
            "http://localhost:3000",
            "http://localhost:8081"
            // se usar Expo web em 19006, adicione:
            // "http://localhost:19006", "http://127.0.0.1:19006"
        ));
        cfg.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        cfg.setAllowedHeaders(List.of("*"));
        cfg.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", cfg);
        return source;
    }

    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity http, AuthTokenFilter authTokenFilter) throws Exception {
        http
            .cors(c -> c.configurationSource(corsConfigurationSource()))
            .csrf(csrf -> csrf.disable())
            .headers(h -> h.frameOptions(f -> f.disable()))
            .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                // CORS preflight sempre liberado
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                // ----- ROTAS PÚBLICAS -----
                .requestMatchers("/auth/password/**").permitAll()
                .requestMatchers(
                    "/",
                    "/files/**",
                    "/api/auth/signup",          // cadastro SEM token
                    "/api/auth/google/**",       // fluxo google
                    "/oauth2/*", "/login/oauth2/*",
                    "/h2-console/**",
                    "/swagger-ui.html", "/swagger-ui/**",
                    "/v3/api-docs", "/v3/api-docs/**", "/v3/api-docs.yaml",
                    "/swagger-resources", "/swagger-resources/**"
                ).permitAll()

                // ----- LOGIN EXIGE TOKEN (BOOT_TOKEN via filtro) -----
                .requestMatchers("/api/auth/signin").authenticated()

                // ----- OUTRAS REGRAS / EXEMPLOS -----
                .requestMatchers("/api/test/admin").hasRole("ADMIN")
                .requestMatchers("/api/test/user").hasRole("USER")
                .requestMatchers("/api/test/all").authenticated()

                .requestMatchers(HttpMethod.POST, "/translate-file").authenticated()
                .requestMatchers("/records/**").authenticated()

                // qualquer outra rota precisa estar autenticada
                .anyRequest().authenticated()
            )
            // API: quando faltar/errar auth, responder 401 (sem redirect)
            .exceptionHandling(e -> e.authenticationEntryPoint(new HttpStatusEntryPoint(HttpStatus.UNAUTHORIZED)))
            // OAuth2 login (se usar Google pelo /oauth2/authorization/google)
            .oauth2Login(oauth -> oauth.successHandler(oAuth2LoginSuccessHandler));

        // nosso filtro de tokens (vai aceitar BOOT_TOKEN em /api/auth/signin)
        http.addFilterBefore(authTokenFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}