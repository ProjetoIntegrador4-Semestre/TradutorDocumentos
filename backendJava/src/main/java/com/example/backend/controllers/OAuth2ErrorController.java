package com.example.backend.controllers;

import java.util.Map;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.servlet.http.HttpServletRequest;

// Controller básico de erro do OAuth2 (só pra depuração)
@RestController
public class OAuth2ErrorController {
  @GetMapping("/oauth2/error")
  public Map<String, Object> oauth2Error(HttpServletRequest req) {
    String msg = (String) req.getParameter("error_description");
    return Map.of("error", "oauth2_failure", "message", msg == null ? "see server logs" : msg);
  }
}

