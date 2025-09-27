package com.example.backend.services.translation;

import java.io.BufferedInputStream;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.nio.file.*;

import org.apache.tika.metadata.Metadata;
import org.apache.tika.parser.AutoDetectParser;
import org.apache.tika.sax.BodyContentHandler;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.example.backend.entities.TranslationRecord;
import com.example.backend.entities.User;
import com.example.backend.repositories.UserRepository;
import com.example.backend.services.storage.StorageService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class TranslationServiceImpl implements TranslationService {

  private final StorageService storage;
  private final LibreTranslateService mt;
  private final TranslationRecordService recordService;
  private final UserRepository userRepository;

  @Override
  public String translate(MultipartFile file, String sourceLang, String targetLang, String username) {
    // 1) salvar upload e extrair texto
    Path uploaded = storage.saveUpload(file);
    String text = extractText(uploaded);

    // 2) detectar idioma se não foi informado
    String detectedLang = (sourceLang == null || sourceLang.isBlank())
        ? mt.detectLanguage(text)
        : sourceLang;

    // 3) traduzir
    String translated = mt.translateLargeText(text, detectedLang, targetLang);

    // 4) gravar arquivo de saída
    String outName = outFileName(file.getOriginalFilename(), targetLang, "txt");
    Path outPath = storage.saveOutput(outName, translated.getBytes(StandardCharsets.UTF_8));

    // 5) buscar usuário logado
    User user = userRepository.findByEmail(username)
        .orElse(null); // se não achar, salva sem user_id

    // 6) salvar registro no banco
    TranslationRecord rec = TranslationRecord.builder()
        .originalFilename(file.getOriginalFilename())
        .fileType(detectFileType(file.getOriginalFilename()))
        .detectedLang(detectedLang)
        .targetLang(targetLang)
        .outputPath(outPath.toString())
        .user(user) // pode ser null, mas se achar associa
        .build();

    recordService.save(rec);

    // 7) devolver o nome do arquivo (o controller já monta o /files/<nome>)
    return outName;
  }

  // ---- helpers --------------------------------------------------------------

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

  private String detectFileType(String name) {
    if (name == null) return "TXT";
    String n = name.toLowerCase();
    if (n.endsWith(".pdf"))  return "PDF";
    if (n.endsWith(".docx")) return "DOCX";
    if (n.endsWith(".pptx")) return "PPTX";
    if (n.endsWith(".txt"))  return "TXT";
    return "FILE";
  }
}
