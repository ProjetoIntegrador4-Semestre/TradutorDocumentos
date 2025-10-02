package com.example.backend.services.translation;

import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;

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

    // 2) Extrai texto (sem POI/Tika para DOCX/PPTX)
    String text = extractText(uploaded, file.getOriginalFilename(), file.getContentType());
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
      ext = mapMimeToExt(file.getContentType());
      if (ext == null) ext = "txt";
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

    long size = file.getSize();

    // 9) Registro
    TranslationRecord rec = TranslationRecord.builder()
        .originalFilename(originalName)
        .fileType(detectFileType(originalName))
        .detectedLang(detectedLang)
        .targetLang(targetLang)
        .outputPath(outPath.toString())
        .fileSizeBytes(size)               
        .user(user)
        .build();
    recordService.save(rec);

    // 10) Devolve o nome para download
    return outName;
  }

  // ========= EXTRAÇÃO DE TEXTO (DOCX/PPTX 100% JDK; PDF/TXT simples) ========

  private String extractText(Path path, String originalName, String contentType) {
    String name = originalName == null ? "" : originalName.toLowerCase();
    String ct   = contentType  == null ? "" : contentType.toLowerCase();

    try {
      if (name.endsWith(".docx") || ct.contains("officedocument.wordprocessingml.document") || isOOXMLDocx(path)) {
        return extractTextDocxViaZip(path);
      }
      if (name.endsWith(".pptx") || ct.contains("officedocument.presentationml.presentation") || isOOXMLPptx(path)) {
        return extractTextPptxViaZip(path);
      }
      if (name.endsWith(".pdf") || ct.contains("application/pdf") || isPdf(path)) {
        // Pode trocar por PDFBox se quiser texto real; para isolar o erro, deixo vazio
        return "";
      }
      if (name.endsWith(".txt") || ct.startsWith("text/")) {
        return Files.readString(path);
      }
      return "";
    } catch (Exception e) {
      throw new RuntimeException("Falha ao extrair texto", e);
    }
  }

  /** DOCX: lê /word/document.xml e remove tags XML (sem POI). */
  private String extractTextDocxViaZip(Path path) throws java.io.IOException {
    StringBuilder sb = new StringBuilder(4096);
    try (var zis = new java.util.zip.ZipInputStream(Files.newInputStream(path))) {
      java.util.zip.ZipEntry e;
      while ((e = zis.getNextEntry()) != null) {
        if ("word/document.xml".equalsIgnoreCase(e.getName())) {
          String xml = new String(zis.readAllBytes(), StandardCharsets.UTF_8);
          sb.append(xmlToPlain(xml));
          break;
        }
      }
    }
    return sb.toString();
  }

  /** PPTX: lê /ppt/slides/slideN.xml em ordem e concatena texto (sem POI). */
  private String extractTextPptxViaZip(Path path) throws java.io.IOException {
    java.util.Map<Integer,String> slides = new java.util.TreeMap<>();
    try (var zis = new java.util.zip.ZipInputStream(Files.newInputStream(path))) {
      java.util.zip.ZipEntry e;
      while ((e = zis.getNextEntry()) != null) {
        String name = e.getName();
        if (name.startsWith("ppt/slides/slide") && name.endsWith(".xml")) {
          String xml = new String(zis.readAllBytes(), StandardCharsets.UTF_8);
          slides.put(parseSlideNumber(name), xmlToPlain(xml));
        }
      }
    }
    StringBuilder sb = new StringBuilder(4096);
    for (var part : slides.values()) {
      sb.append(part).append(System.lineSeparator());
    }
    return sb.toString();
  }

  private int parseSlideNumber(String name) {
    // "ppt/slides/slide12.xml" -> 12
    try {
      String base = name.substring(name.lastIndexOf('/') + 1); // slide12.xml
      String num  = base.substring(5, base.length() - 4);
      return Integer.parseInt(num);
    } catch (Exception ignore) {
      return Integer.MAX_VALUE;
    }
  }

  /** Remove tags e desescapa entidades XML básicas. */
  private String xmlToPlain(String xml) {
    if (xml == null || xml.isBlank()) return "";
    String s = xml.replaceAll("(?s)<[^>]+>", " "); // remove tags
    s = s.replace("&amp;", "&")
         .replace("&lt;", "<")
         .replace("&gt;", ">")
         .replace("&quot;", "\"")
         .replace("&apos;", "'");
    return s.replaceAll("[ \\t\\x0B\\f\\r]+", " ")
            .replaceAll(" *\\n *", "\n")
            .trim();
  }

  private boolean isPdf(Path path) {
    try (var is = Files.newInputStream(path)) {
      byte[] header = is.readNBytes(5);
      return header.length >= 5 && header[0] == '%' && header[1] == 'P' && header[2] == 'D' && header[3] == 'F' && header[4] == '-';
    } catch (Exception ignored) { return false; }
  }

  private boolean isOOXMLDocx(Path path) {
    return zipHasEntry(path, "word/document.xml");
  }

  private boolean isOOXMLPptx(Path path) {
    return zipHasEntry(path, "ppt/presentation.xml");
  }

  private boolean zipHasEntry(Path path, String entry) {
    try (var zis = new java.util.zip.ZipInputStream(Files.newInputStream(path))) {
      java.util.zip.ZipEntry e;
      while ((e = zis.getNextEntry()) != null) {
        if (e.getName().equalsIgnoreCase(entry)) return true;
      }
    } catch (Exception ignored) {}
    return false;
  }

  // ========= HELPERS DE NOME/EXTENSÃO =======================================

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
