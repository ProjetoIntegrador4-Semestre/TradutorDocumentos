package com.example.backend.services.translation;

import java.io.BufferedInputStream;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;

import org.apache.tika.metadata.Metadata;
import org.apache.tika.parser.AutoDetectParser;
import org.apache.tika.sax.BodyContentHandler;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.example.backend.entities.TranslationRecord;
import com.example.backend.entities.User;
import com.example.backend.repositories.UserRepository;
import com.example.backend.services.generation.DocxGenerator;
import com.example.backend.services.generation.PdfGenerator;
import com.example.backend.services.generation.PptxGenerator;
import com.example.backend.services.storage.StorageService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class TranslationServiceImpl implements TranslationService {

  private final StorageService storage;
  private final LibreTranslateService mt;
  private final TranslationRecordService recordService;
  private final UserRepository userRepository;

  private final DocxGenerator docxGenerator;
  private final PptxGenerator pptxGenerator;
  private final PdfGenerator  pdfGenerator;

  @Override
  public String translate(MultipartFile file, String sourceLang, String targetLang, String username) {
    // 1) Salva upload físico
    Path uploaded = storage.saveUpload(file);

    // 2) Extrai texto
    String text = extractText(uploaded);
    if (text == null || text.isBlank()) {
      text = "(sem conteúdo detectável)";
    }

    // 3) Detecta idioma (se não vier)
    String detectedLang = (sourceLang == null || sourceLang.isBlank())
        ? mt.detectLanguage(text)
        : sourceLang;

    // 4) Tradução
    String translated = mt.translateLargeText(text, detectedLang, targetLang);

    // 5) Decide extensão de saída a partir do nome OU do MIME
    final String originalName = sanitizeFilename(file.getOriginalFilename());
    String ext = getExtensionSafe(originalName);
    if (ext == null) {
      ext = mapMimeToExt(file.getContentType()); // tenta pelo MIME
      if (ext == null) ext = "txt";              // fallback final
    }

    // 6) Gera bytes no mesmo formato do input
    byte[] bytesOut = switch (ext.toLowerCase()) {
      case "docx" -> docxGenerator.generateFromPlainText(translated);
      case "pptx" -> pptxGenerator.generateFromPlainText(translated);
      case "pdf"  -> pdfGenerator.generateFromPlainText(translated);
      case "txt"  -> translated.getBytes(StandardCharsets.UTF_8);
      default     -> translated.getBytes(StandardCharsets.UTF_8);
    };

    // 7) Salva arquivo de saída COM A MESMA EXTENSÃO
    String outName = outFileName(originalName, targetLang, ext);
    Path outPath = storage.saveOutput(outName, bytesOut);

    // 8) Usuário (pode ser null)
    User user = userRepository.findByEmail(username).orElse(null);

    // 9) Registro
    TranslationRecord rec = TranslationRecord.builder()
        .originalFilename(originalName)
        .fileType(detectFileType(originalName))
        .detectedLang(detectedLang)
        .targetLang(targetLang)
        .outputPath(outPath.toString())
        .user(user)
        .build();
    recordService.save(rec);

    // 10) Devolve o nome para download
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

  private String getExtensionSafe(String name) {
    if (name == null || name.isBlank()) return null;
    String b = Path.of(name).getFileName().toString();
    int dot = b.lastIndexOf('.');
    if (dot < 0 || dot == b.length() - 1) return null;
    return b.substring(dot + 1);
  }

  private String mapMimeToExt(String contentType) {
    if (contentType == null) return null;
    String ct = contentType.toLowerCase();
    if (MediaType.APPLICATION_PDF_VALUE.equals(ct) || ct.contains("application/pdf")) return "pdf";
    if (ct.contains("officedocument.wordprocessingml.document")) return "docx";
    if (ct.contains("officedocument.presentationml.presentation")) return "pptx";
    if (ct.startsWith("text/")) return "txt";
    return null;
  }

  private String sanitizeFilename(String name) {
    if (name == null) return null;
    // remove caracteres que podem confundir FS / nginx / S3, mas mantém extensão
    return name.replaceAll("[\\r\\n\\t]", " ")
               .replaceAll("[\\\\/:*?\"<>|]", "_")
               .trim();
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
