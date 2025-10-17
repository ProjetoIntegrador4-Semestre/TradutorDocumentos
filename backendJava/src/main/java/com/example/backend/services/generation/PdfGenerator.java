package com.example.backend.services.generation;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.font.PDFont;
import org.apache.pdfbox.pdmodel.font.PDType0Font;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

@Service
public class PdfGenerator {

  private static final float MARGIN = 50f;
  private static final float FONT_SIZE = 12f;
  private static final float LEADING = 14f;

  public byte[] generateFromPlainText(String text) {
    try (PDDocument doc = new PDDocument(); ByteArrayOutputStream baos = new ByteArrayOutputStream()) {

      PDFont font = tryLoadUnicodeFont(doc);
      PDRectangle pageSize = PDRectangle.LETTER;
      float usableWidth = pageSize.getWidth() - (MARGIN * 2);

      // estado da página
      PDPage page = new PDPage(pageSize);
      doc.addPage(page);
      float cursorY = pageSize.getHeight() - MARGIN;

      // abre stream desta página
      PDPageContentStream cs = openPage(doc, page, font, cursorY);

      // escreve
      for (String rawPara : text.split("\\R", -1)) {
        String para = ensureEncodable(normalize(rawPara), font);
        for (String line : wrap(para, font, FONT_SIZE, usableWidth)) {

          // precisa de nova página?
          if (cursorY - LEADING < MARGIN) {
            cs.endText();
            cs.close();

            page = new PDPage(pageSize);
            doc.addPage(page);
            cursorY = pageSize.getHeight() - MARGIN;
            cs = openPage(doc, page, font, cursorY);
          }

          cs.showText(line);
          cs.newLine();
          cursorY -= LEADING;
        }

        // linha em branco entre parágrafos
        if (cursorY - LEADING < MARGIN) {
          cs.endText();
          cs.close();

          page = new PDPage(pageSize);
          doc.addPage(page);
          cursorY = pageSize.getHeight() - MARGIN;
          cs = openPage(doc, page, font, cursorY);
        }
        cs.newLine();
        cursorY -= LEADING;
      }

      cs.endText();
      cs.close();

      doc.save(baos);
      return baos.toByteArray();
    } catch (IOException e) {
      throw new RuntimeException("Falha ao gerar PDF", e);
    }
  }

  // --- helpers ---------------------------------------------------------------

  private PDPageContentStream openPage(PDDocument doc, PDPage page, PDFont font, float cursorY) throws IOException {
    PDPageContentStream cs = new PDPageContentStream(doc, page);
    cs.beginText();
    cs.setFont(font, FONT_SIZE);
    cs.setLeading(LEADING);
    cs.newLineAtOffset(MARGIN, cursorY);
    return cs;
  }

  /** quebra por largura usando medição real da fonte */
  private List<String> wrap(String text, PDFont font, float fontSize, float maxWidth) throws IOException {
    List<String> lines = new ArrayList<>();
    if (text == null || text.isEmpty()) {
      lines.add("");
      return lines;
    }
    String[] words = text.split("\\s+");
    StringBuilder current = new StringBuilder();
    for (String w : words) {
      String candidate = current.length() == 0 ? w : current + " " + w;
      float wpt = font.getStringWidth(candidate) / 1000f * fontSize;
      if (wpt <= maxWidth) {
        current.setLength(0);
        current.append(candidate);
      } else {
        if (current.length() > 0) {
          lines.add(current.toString());
          current.setLength(0);
          current.append(w);
        } else {
          // palavra sozinha ultrapassa largura -> quebra forçada
          lines.addAll(forceBreakWord(w, font, fontSize, maxWidth));
          current.setLength(0);
        }
      }
    }
    if (current.length() > 0) lines.add(current.toString());
    return lines;
  }

  private List<String> forceBreakWord(String word, PDFont font, float fontSize, float maxWidth) throws IOException {
    List<String> parts = new ArrayList<>();
    StringBuilder buf = new StringBuilder();
    for (int i = 0; i < word.length(); i++) {
      buf.append(word.charAt(i));
      float wpt = font.getStringWidth(buf.toString()) / 1000f * fontSize;
      if (wpt > maxWidth) {
        if (buf.length() > 1) {
          parts.add(buf.substring(0, buf.length() - 1));
          buf.setLength(0);
          buf.append(word.charAt(i));
        } else {
          parts.add(buf.toString());
          buf.setLength(0);
        }
      }
    }
    if (buf.length() > 0) parts.add(buf.toString());
    return parts;
  }

  /** tenta carregar TTF unicode do classpath ou SO; se falhar, Type1 Helvetica */
  private PDFont tryLoadUnicodeFont(PDDocument doc) throws IOException {
    // classpath
    for (String cp : new String[]{"fonts/DejaVuSans.ttf", "fonts/NotoSans-Regular.ttf"}) {
      ClassPathResource res = new ClassPathResource(cp);
      if (res.exists()) try (InputStream is = res.getInputStream()) {
        return PDType0Font.load(doc, is, true);
      }
    }
    // sistema
    for (String p : new String[]{
        "C:/Windows/Fonts/arial.ttf",
        "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
        "/usr/share/fonts/truetype/noto/NotoSans-Regular.ttf"
    }) {
      Path path = Path.of(p);
      if (Files.exists(path)) try (InputStream is = Files.newInputStream(path)) {
        return PDType0Font.load(doc, is, true);
      }
    }
    return PDType1Font.HELVETICA; // fallback
  }

  /** normaliza símbolos problemáticos */
  private String normalize(String s) {
    if (s == null) return "";
    return s
        .replace('\uF0B7', '\u2022')   // bullets privados → bullet real
        .replace('\uF0A7', '\u25C6')
        .replace('\u00A0', ' ')
        .replace('\u201C', '"').replace('\u201D', '"')
        .replace('\u2018', '\'').replace('\u2019', '\'')
        .replace('\u2013', '-').replace('\u2014', '-');
  }

  /** remove/ajusta caracteres não encodáveis pela fonte atual */
  private String ensureEncodable(String s, PDFont font) {
    StringBuilder out = new StringBuilder(s.length());
    for (int i = 0; i < s.length(); i++) {
      char ch = s.charAt(i);
      String one = String.valueOf(ch);
      boolean ok = true;
      try {
        font.encode(one);
      } catch (IllegalArgumentException | IOException ex) {
        ok = false;
      }
      if (ok) out.append(ch);
      else out.append(ch == '\u2022' ? '*' : '?');
    }
    return out.toString();
  }
}
