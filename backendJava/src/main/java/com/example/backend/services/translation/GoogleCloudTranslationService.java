package com.example.backend.services.translation;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.google.cloud.ServiceOptions;
import com.google.cloud.translate.v3.DetectLanguageRequest;
import com.google.cloud.translate.v3.DetectLanguageResponse;
import com.google.cloud.translate.v3.LocationName;
import com.google.cloud.translate.v3.TranslateTextRequest;
import com.google.cloud.translate.v3.TranslateTextResponse;
import com.google.cloud.translate.v3.Translation;
import com.google.cloud.translate.v3.TranslationServiceClient;

@Service
public class GoogleCloudTranslationService {

  @Value("${gcp.translate.location:global}") private String location;

  public String detectLanguage(String text) {
    if (text == null || text.isBlank()) return "und";
    String pid = ServiceOptions.getDefaultProjectId();
    if (pid == null || pid.isBlank()) {
      throw new IllegalStateException("Project ID não encontrado nas credenciais (GOOGLE_APPLICATION_CREDENTIALS).");
    }

    try (TranslationServiceClient client = TranslationServiceClient.create()) {
      String parent = LocationName.of(pid, location).toString();
      DetectLanguageRequest req = DetectLanguageRequest.newBuilder()
          .setParent(parent)
          .setMimeType("text/plain")
          .setContent(trimForDetection(text, 5000)) // evita payload gigante
          .build();
      DetectLanguageResponse resp = client.detectLanguage(req);

      // Pega o código mais provável
      if (!resp.getLanguagesList().isEmpty()) {
        return resp.getLanguagesList().get(0).getLanguageCode();
      }
      return "und";
    } catch (IOException e) {
      throw new RuntimeException("Erro ao detectar idioma", e);
    }
  }

  private String trimForDetection(String s, int max) {
    return s.length() > max ? s.substring(0, max) : s;
  }

  public String translateLargeText(String text, String sourceLang, String targetLang) {
    if (text == null || text.isEmpty()) return "";

    String pid = ServiceOptions.getDefaultProjectId();
    if (pid == null || pid.isBlank()) {
      throw new IllegalStateException("Project ID não encontrado nas credenciais (GOOGLE_APPLICATION_CREDENTIALS).");
    }

    List<String> chunks = chunk(text, 20_000);
    List<String> out = new ArrayList<>();

    try (TranslationServiceClient client = TranslationServiceClient.create()) {
      String parent = LocationName.of(pid, location).toString();

      for (String part : chunks) {
        TranslateTextRequest.Builder b = TranslateTextRequest.newBuilder()
            .setParent(parent)
            .setMimeType("text/plain")
            .setTargetLanguageCode(targetLang)
            .addContents(part);

        if (sourceLang != null && !sourceLang.isBlank()) {
          b.setSourceLanguageCode(sourceLang);
        }
        TranslateTextResponse resp = client.translateText(b.build());

        StringBuilder sb = new StringBuilder();
        for (Translation t : resp.getTranslationsList()) sb.append(t.getTranslatedText());
        out.add(sb.toString());
      }
    } catch (IOException e) {
      throw new RuntimeException("Erro ao traduzir", e);
    }
    return String.join("", out);
  }

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
