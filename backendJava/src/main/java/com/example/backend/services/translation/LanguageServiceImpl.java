package com.example.backend.services.translation;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import com.example.backend.dto.translation.LangDto;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class LanguageServiceImpl implements LanguageService {

  private final RestClient restClient;

  /** payload vindo do LibreTranslate (code/name) */
  private record LibreLang(String code, String name) {}

  private static final ParameterizedTypeReference<List<LibreLang>> LIST_OF_LANGS =
      new ParameterizedTypeReference<>() {};

  @Override
  public List<LangDto> list() {
    try {
      ResponseEntity<List<LibreLang>> resp = restClient.get()
          .uri("/languages")
          .retrieve()
          .toEntity(LIST_OF_LANGS);

      if (!resp.getStatusCode().is2xxSuccessful()) {
        log.warn("GET /languages retornou status {}", resp.getStatusCode().value());
        return fallbackLanguages("HTTP " + resp.getStatusCode().value());
      }

      List<LibreLang> body = resp.getBody();
      if (body == null || body.isEmpty()) {
        log.warn("GET /languages retornou corpo vazio");
        return fallbackLanguages("corpo vazio");
      }

      // Dedup por code preservando a primeira ocorrência (LinkedHashMap) e ordena por nome
      Map<String, LangDto> unique = new LinkedHashMap<>();
      for (LibreLang l : body) {
        if (l == null) continue;
        String code = safe(l.code());
        String name = safe(l.name());
        if (code.isBlank() || name.isBlank()) continue;
        unique.putIfAbsent(code, new LangDto(code, name));
      }

      List<LangDto> out = new ArrayList<>(unique.values());
      // Usa getter do seu DTO (não record)
      out.sort(Comparator.comparing(LangDto::getName, String.CASE_INSENSITIVE_ORDER));
      return out;

    } catch (RestClientException e) {
      log.error("Falha ao consultar /languages no provedor: {}", e.getMessage(), e);
      return fallbackLanguages(e.getClass().getSimpleName());
    } catch (Exception e) {
      log.error("Erro inesperado em LanguageServiceImpl.list(): {}", e.getMessage(), e);
      return fallbackLanguages("erro inesperado");
    }
  }

  // ---------- helpers ----------

  private static String safe(String s) {
    return s == null ? "" : s.trim();
  }

  /** Fallback mínimo para a UI não quebrar se o provedor estiver fora. */
  private List<LangDto> fallbackLanguages(String reason) {
    log.info("Usando fallback de idiomas ({})", reason);
    return List.of(
        new LangDto("en", "English"),
        new LangDto("es", "Spanish"),
        new LangDto("fr", "French"),
        new LangDto("de", "German"),
        new LangDto("pt", "Portuguese")
    );
  }
}
