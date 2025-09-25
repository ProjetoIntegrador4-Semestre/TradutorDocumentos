package com.example.backend.services.translation;

import java.io.BufferedInputStream;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;

import org.apache.tika.metadata.Metadata;
import org.apache.tika.parser.AutoDetectParser;
import org.apache.tika.sax.BodyContentHandler;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.example.backend.services.storage.StorageService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class TranslationServiceImpl implements TranslationService {

  private final StorageService storage;
  private final GoogleCloudTranslationService gtranslator;

  @Override
  public String translate(MultipartFile file, String sourceLang, String targetLang) {
    Path uploaded = storage.saveUpload(file);
    String text = extractText(uploaded);

    // Detecta automaticamente se não veio source_lang
    String effectiveSrc = (sourceLang == null || sourceLang.isBlank())
        ? gtranslator.detectLanguage(text)
        : sourceLang;
    
    String translated = gtranslator.translateLargeText(text, sourceLang, targetLang);
    String outName = outFileName(file.getOriginalFilename(), targetLang, "txt");
    storage.saveOutput(outName, translated.getBytes(StandardCharsets.UTF_8));
    return outName;
  }

  private String extractText(Path path) {
    try (InputStream is = new BufferedInputStream(Files.newInputStream(path))) {
      var parser = new AutoDetectParser();
      var handler = new BodyContentHandler(-1);
      var metadata = new Metadata();
      parser.parse(is, handler, metadata);
      return handler.toString();
    } catch (Exception e) {
      throw new RuntimeException("Falha ao extrair texto com Tika", e);
    }
  }

  private String outFileName(String original, String targetLang, String ext) {
    String base = (original == null ? "file" : Path.of(original).getFileName().toString());
    int dot = base.lastIndexOf('.');
    if (dot > 0) base = base.substring(0, dot);
    return base + "." + targetLang + "." + ext;
  }
}
