package com.example.backend.services.translation;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClient;

@Service
public class LibreTranslateService {

  private final RestClient http;
  private final String baseUrl;
  private final String apiKey;

  public LibreTranslateService(
      @Value("${libre.base-url}") String baseUrl,
      @Value("${libre.api-key:}") String apiKey) {
    this.baseUrl = baseUrl.endsWith("/") ? baseUrl.substring(0, baseUrl.length()-1) : baseUrl;
    this.apiKey = apiKey == null ? "" : apiKey;
    this.http = RestClient.builder().baseUrl(this.baseUrl).build();
  }

  /** Detecta idioma (ex.: "en", "pt", "es"). */
  public String detectLanguage(String text) {
    if (text == null || text.isBlank()) return "und";

    MultiValueMap<String, String> form = new LinkedMultiValueMap<>();
    form.add("q", trim(text, 5000));
    if (!apiKey.isBlank()) form.add("api_key", apiKey);

    List<?> detections = http.post()
        .uri("/detect")
        .contentType(MediaType.APPLICATION_FORM_URLENCODED)
        .body(form)
        .retrieve()
        .body(List.class); // ex.: [{language:"en", confidence:0.99}, ...]

    if (detections == null || detections.isEmpty()) return "und";
    @SuppressWarnings("unchecked")
    Map<String, Object> top = (Map<String, Object>) detections.get(0);
    Object lang = top.get("language");
    return lang == null ? "und" : lang.toString();
  }

  /** Tradução em blocos (conservador: 5000 chars). */
  public String translateLargeText(String text, String sourceLang, String targetLang) {
    if (text == null || text.isEmpty()) return "";
    List<String> chunks = chunk(text, 5000);
    List<String> out = new ArrayList<>();

    for (String part : chunks) {
      out.add(translateChunk(part, sourceLang, targetLang));
    }
    return String.join("", out);
  }

  private String translateChunk(String part, String sourceLang, String targetLang) {
    MultiValueMap<String, String> form = new LinkedMultiValueMap<>();
    form.add("q", part);
    form.add("target", targetLang);
    form.add("source", (sourceLang == null || sourceLang.isBlank() || "und".equals(sourceLang)) ? "auto" : sourceLang);
    form.add("format", "text");
    if (!apiKey.isBlank()) form.add("api_key", apiKey);

    @SuppressWarnings("unchecked")
    Map<String, Object> resp = http.post()
        .uri("/translate")
        .contentType(MediaType.APPLICATION_FORM_URLENCODED)
        .body(form)
        .retrieve()
        .body(Map.class); // { translatedText: "..." }

    return resp == null ? "" : String.valueOf(resp.getOrDefault("translatedText", ""));
  }

  private String trim(String s, int max) { return s.length() > max ? s.substring(0, max) : s; }

  private List<String> chunk(String text, int max) {
    List<String> parts = new ArrayList<>();
    int i = 0;
    while (i < text.length()) {
      int end = Math.min(i + max, text.length());
      int lastBreak = text.lastIndexOf('\n', end);
      if (lastBreak <= i) lastBreak = end;
      parts.add(text.substring(i, lastBreak));
      i = lastBreak;
    }
    return parts;
  }
}

