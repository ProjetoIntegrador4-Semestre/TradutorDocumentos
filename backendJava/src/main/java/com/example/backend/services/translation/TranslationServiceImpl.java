package com.example.backend.services.translation;

import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

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

     // Defina o tamanho máximo permitido 
    long MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

    // Verifica se o tamanho do arquivo excede o limite
    long size = file.getSize();
    if (size > MAX_FILE_SIZE) {
      throw new ResponseStatusException(HttpStatus.PAYLOAD_TOO_LARGE, "O arquivo excede o tamanho máximo permitido de 5MB.");
    }

    // 1) salva upload
    Path uploaded = storage.saveUpload(file);

    // 2) extrai texto conforme o tipo
    String text = extractText(uploaded, file.getOriginalFilename(), file.getContentType());
    if (text == null || text.isBlank()) {
      text = "(sem conteúdo detectável)";
    }

    // 3) detecta idioma (se não informado)
    String detectedLang = (sourceLang == null || sourceLang.isBlank())
        ? mt.detectLanguage(text)
        : sourceLang;

    // 4) traduz
    String translated = mt.translateLargeText(text, detectedLang, targetLang);

    // 5) decide extensão do output com base no input
    final String originalName = sanitizeFilename(file.getOriginalFilename());
    String ext = getExtensionSafe(originalName);
    if (ext == null) {
      ext = mapMimeToExt(file.getContentType());
      if (ext == null) ext = "txt";
    }

    // 6) gera bytes no mesmo formato
    byte[] bytesOut = switch (ext.toLowerCase()) {
      case "docx" -> docxGenerator.generateFromPlainText(translated);
      case "pptx" -> pptxGenerator.generateFromPlainText(translated);
      case "pdf"  -> pdfGenerator.generateFromPlainText(translated);
      case "txt"  -> translated.getBytes(StandardCharsets.UTF_8);
      default     -> translated.getBytes(StandardCharsets.UTF_8);
    };

    // 7) salva saída
    String outName = outFileName(originalName, targetLang, ext);
    Path outPath = storage.saveOutput(outName, bytesOut);

    // 8) usuário (opcional)
    User user = userRepository.findByEmail(username).orElse(null);

    // 9) registra no banco
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

    // 10) retorna o nome do arquivo para download
    return outName;
  }

  // ========================= EXTRAÇÃO DE TEXTO ===============================

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
        return extractTextPdf(path);
      }
      if (name.endsWith(".txt") || ct.startsWith("text/")) {
        return Files.readString(path);
      }
      return "";
    } catch (Exception e) {
      throw new RuntimeException("Falha ao extrair texto", e);
    }
  }

  /** DOCX: lê /word/document.xml e preserva parágrafos e bullets. */
  private String extractTextDocxViaZip(Path path) throws java.io.IOException {
    String xml = null;
    try (var zis = new java.util.zip.ZipInputStream(Files.newInputStream(path))) {
      java.util.zip.ZipEntry e;
      while ((e = zis.getNextEntry()) != null) {
        if ("word/document.xml".equalsIgnoreCase(e.getName())) {
          xml = new String(zis.readAllBytes(), StandardCharsets.UTF_8);
          break;
        }
      }
    }
    if (xml == null) return "";
    return docxXmlToPlain(xml);
  }

  /** PPTX: lê /ppt/slides/slideN.xml em ordem e concatena texto. */
  private String extractTextPptxViaZip(Path path) throws java.io.IOException {
    java.util.Map<Integer,String> slides = new java.util.TreeMap<>();
    try (var zis = new java.util.zip.ZipInputStream(Files.newInputStream(path))) {
      java.util.zip.ZipEntry e;
      while ((e = zis.getNextEntry()) != null) {
        String name = e.getName();
        if (name.startsWith("ppt/slides/slide") && name.endsWith(".xml")) {
          String xml = new String(zis.readAllBytes(), StandardCharsets.UTF_8);
          slides.put(parseSlideNumber(name), pptxXmlToPlain(xml));
        }
      }
    }
    StringBuilder sb = new StringBuilder(4096);
    for (var part : slides.values()) {
      sb.append(part).append(System.lineSeparator());
    }
    return sb.toString();
  }

  /** PDF: usa PDFBox para extrair texto (com ordenação). */
  private String extractTextPdf(Path path) throws java.io.IOException {
    try (var is = Files.newInputStream(path);
         var doc = org.apache.pdfbox.pdmodel.PDDocument.load(is)) {
      var stripper = new org.apache.pdfbox.text.PDFTextStripper();
      stripper.setSortByPosition(true);
      stripper.setStartPage(1);
      stripper.setEndPage(Integer.MAX_VALUE);
      String text = stripper.getText(doc);
      if (text == null) return "";
      return text
          .replace('\u00A0', ' ')
          .replace('\uF0B7', '\u2022');
    }
  }

  // ---- Conversores de XML -> texto -----------------------------------------

  /** Converte o XML de word/document.xml em texto plano, preservando parágrafos e bullets. */
  private String docxXmlToPlain(String xml) {
    if (xml == null || xml.isBlank()) return "";

    xml = xml.replace("&amp;", "&")
             .replace("&lt;", "<")
             .replace("&gt;", ">")
             .replace("&quot;", "\"")
             .replace("&apos;", "'");

    StringBuilder out = new StringBuilder(4096);

    java.util.regex.Pattern P_PARA =
        java.util.regex.Pattern.compile("<w:p[^>]*>(.+?)</w:p>", java.util.regex.Pattern.DOTALL);
    java.util.regex.Matcher mPara = P_PARA.matcher(xml);

    java.util.regex.Pattern P_TEXT =
        java.util.regex.Pattern.compile("<w:t[^>]*>(.*?)</w:t>", java.util.regex.Pattern.DOTALL);

    while (mPara.find()) {
      String pXml = mPara.group(1);
      boolean isBullet = pXml.contains("<w:numPr");

      pXml = pXml.replaceAll("<w:br\\s*/>", "\n")
                 .replaceAll("<w:tab\\s*/>", "\t");

      StringBuilder pText = new StringBuilder();
      java.util.regex.Matcher mTxt = P_TEXT.matcher(pXml);
      while (mTxt.find()) {
        String t = mTxt.group(1).replaceAll("<[^>]+>", "");
        pText.append(t);
      }

      String para = pText.toString()
          .replace('\u00A0', ' ')
          .replace('\uF0B7', '\u2022')
          .replaceAll("[ \\t\\x0B\\f\\r]+", " ")
          .trim();

      if (!para.isEmpty()) {
        if (isBullet) out.append("• ").append(para);
        else out.append(para);
        out.append("\n\n");
      }
    }

    return out.toString().trim();
  }

  /** Converte o XML de um slide (ppt/slides/slideN.xml) em texto, preservando bullets. */
  private String pptxXmlToPlain(String xml) {
    if (xml == null || xml.isBlank()) return "";

    xml = xml.replace("&amp;", "&")
             .replace("&lt;", "<")
             .replace("&gt;", ">")
             .replace("&quot;", "\"")
             .replace("&apos;", "'");

    StringBuilder out = new StringBuilder(2048);

    java.util.regex.Pattern P_PARA =
        java.util.regex.Pattern.compile("<a:p[^>]*>(.+?)</a:p>", java.util.regex.Pattern.DOTALL);
    java.util.regex.Matcher mPara = P_PARA.matcher(xml);

    java.util.regex.Pattern P_TEXT =
        java.util.regex.Pattern.compile("<a:t[^>]*>(.*?)</a:t>", java.util.regex.Pattern.DOTALL);

    while (mPara.find()) {
      String pXml = mPara.group(1);
      boolean isBullet = pXml.contains("<a:bu") || pXml.contains("buAutoNum") || pXml.contains("buChar");

      pXml = pXml.replaceAll("<a:br\\s*/>", "\n")
                 .replaceAll("<a:tab\\s*/>", "\t");

      StringBuilder pText = new StringBuilder();
      java.util.regex.Matcher mTxt = P_TEXT.matcher(pXml);
      while (mTxt.find()) {
        String t = mTxt.group(1).replaceAll("<[^>]+>", "");
        pText.append(t);
      }

      String para = pText.toString()
          .replace('\u00A0', ' ')
          .replace('\uF0B7', '\u2022')
          .replaceAll("[ \\t\\x0B\\f\\r]+", " ")
          .trim();

      if (!para.isEmpty()) {
        if (isBullet) out.append("• ").append(para);
        else out.append(para);
        out.append("\n");
      }
    }

    return out.toString().trim();
  }

  // ========================= UTILITÁRIOS =====================================

  private boolean isPdf(Path path) {
    try (var is = Files.newInputStream(path)) {
      byte[] header = is.readNBytes(5);
      return header.length >= 5 && header[0] == '%' && header[1] == 'P'
          && header[2] == 'D' && header[3] == 'F' && header[4] == '-';
    } catch (Exception ignored) { return false; }
  }

  private boolean isOOXMLDocx(Path path) { return zipHasEntry(path, "word/document.xml"); }
  private boolean isOOXMLPptx(Path path) { return zipHasEntry(path, "ppt/presentation.xml"); }

  private boolean zipHasEntry(Path path, String entry) {
    try (var zis = new java.util.zip.ZipInputStream(Files.newInputStream(path))) {
      java.util.zip.ZipEntry e;
      while ((e = zis.getNextEntry()) != null) {
        if (e.getName().equalsIgnoreCase(entry)) return true;
      }
    } catch (Exception ignored) {}
    return false;
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

  private int parseSlideNumber(String name) {
    try {
      String base = name.substring(name.lastIndexOf('/') + 1); // slide12.xml
      String num  = base.substring(5, base.length() - 4);
      return Integer.parseInt(num);
    } catch (Exception ignore) {
      return Integer.MAX_VALUE;
    }
  }
}