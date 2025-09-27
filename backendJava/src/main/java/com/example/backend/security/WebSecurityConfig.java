package com.example.backend.security;

import java.util.List;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
@EnableMethodSecurity(prePostEnabled = true)
public class WebSecurityConfig {

  private final UserDetailsServiceImpl userDetailsService;

  public WebSecurityConfig(UserDetailsServiceImpl userDetailsService) {
    this.userDetailsService = userDetailsService;
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
    cfg.setAllowedOrigins(List.of("http://localhost:8080", "http://localhost:3000", "http://localhost:8081"));
    cfg.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
    cfg.setAllowedHeaders(List.of("*"));
    cfg.setAllowCredentials(true);
    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration("/**", cfg);
    return source;
  }

  // ✅ Define o filtro JWT como bean
  @Bean
  public AuthTokenFilter authTokenFilter() {
    return new AuthTokenFilter();
  }

  @Bean
  SecurityFilterChain securityFilterChain(HttpSecurity http, AuthTokenFilter authTokenFilter) throws Exception {
      http
        .cors(c -> c.configurationSource(corsConfigurationSource()))
        .csrf(csrf -> csrf.disable())
        .headers(h -> h.frameOptions(f -> f.disable()))
        .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
        .authorizeHttpRequests(auth -> auth
          .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

          // 🔒 precisa estar autenticado
          .requestMatchers(HttpMethod.POST, "/translate-file").authenticated()
          .requestMatchers("/records/**").authenticated()

          // 🌍 abertos
          .requestMatchers(
          "/",
          "/files/**",
          "/api/auth/**",
          "/h2-console/**",
          "/swagger-ui.html", "/swagger-ui/**",
          "/v3/api-docs", "/v3/api-docs/**", "/v3/api-docs.yaml",
          "/swagger-resources", "/swagger-resources/**"
          ).permitAll()


          // qualquer outro endpoint precisa estar logado
          .anyRequest().authenticated()
        );

      // 🔑 registra o filtro JWT antes do UsernamePasswordAuthenticationFilter
      http.addFilterBefore(authTokenFilter, UsernamePasswordAuthenticationFilter.class);

      return http.build();
  }
}
