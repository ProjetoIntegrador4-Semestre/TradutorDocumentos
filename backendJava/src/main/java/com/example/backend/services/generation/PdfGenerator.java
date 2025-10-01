package com.example.backend.services.generation;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;

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

  public byte[] generateFromPlainText(String text) {
    try (PDDocument doc = new PDDocument(); ByteArrayOutputStream baos = new ByteArrayOutputStream()) {

      PDFont font = tryLoadUnicodeFont(doc); // tenta DejaVu/Noto; senão usa Helvetica (Type1)

      final float margin = 50f;
      final float lineHeight = 14f;

      PDPage page = new PDPage(PDRectangle.LETTER);
      doc.addPage(page);
      PDPageContentStream cs = new PDPageContentStream(doc, page);

      float y = page.getMediaBox().getHeight() - margin;

      cs.beginText();
      cs.setFont(font, 12);
      cs.newLineAtOffset(margin, y);

      for (String rawLine : text.split("\\R", -1)) {
        String line = normalizeForPdf(rawLine);
        line = ensureEncodable(line, font);

        cs.showText(line);
        cs.newLineAtOffset(0, -lineHeight);
        y -= lineHeight;

        if (y < margin) {
          cs.endText();
          cs.close();

          page = new PDPage(PDRectangle.LETTER);
          doc.addPage(page);
          cs = new PDPageContentStream(doc, page);
          y = page.getMediaBox().getHeight() - margin;

          cs.beginText();
          cs.setFont(font, 12);
          cs.newLineAtOffset(margin, y);
        }
      }

      cs.endText();
      cs.close();

      doc.save(baos);
      return baos.toByteArray();
    } catch (IOException e) {
      throw new RuntimeException("Falha ao gerar PDF", e);
    }
  }

  // -------- helpers --------

  /** Tenta carregar TTF unicode do classpath ou do SO; se falhar, volta para Helvetica (Type1). */
  private PDFont tryLoadUnicodeFont(PDDocument doc) throws IOException {
    // 1) classpath
    for (String cp : new String[]{"/fonts/DejaVuSans.ttf", "/fonts/NotoSans-Regular.ttf"}) {
      var res = new ClassPathResource(cp.startsWith("/") ? cp.substring(1) : cp);
      if (res.exists()) try (InputStream is = res.getInputStream()) {
        return PDType0Font.load(doc, is, true);
      }
    }
    // 2) sistema
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
    // 3) fallback Type1 (sem Unicode completo)
    return PDType1Font.HELVETICA;
  }

  /** Normaliza símbolos “problemáticos” (PUA, aspas curvas, travessões, NBSP etc.). */
  private String normalizeForPdf(String s) {
    if (s == null) return "";
    return s
        .replace('\uF0B7', '\u2022')   // bullet privado → bullet real •
        .replace('\uF0A7', '\u25C6')   // diamante privado → ♦ (ajuste se quiser)
        .replace('\u00A0', ' ')        // NBSP → espaço normal
        .replace('\u201C', '"').replace('\u201D', '"') // aspas curvas →
        .replace('\u2018', '\'').replace('\u2019', '\'') // apóstrofos curvos →
        .replace('\u2013', '-').replace('\u2014', '-'); // en/em dash → hífen
  }

    private String ensureEncodable(String s, PDFont font) {
        StringBuilder out = new StringBuilder(s.length());
        for (int i = 0; i < s.length(); i++) {
            char ch = s.charAt(i);
            String one = String.valueOf(ch);
            boolean encodable = true;
            try {
                // Se não for encodável pela fonte, o PDFBox lança IllegalArgumentException
                // e em algumas versões também pode lançar IOException.
                font.encode(one);
            } catch (IllegalArgumentException | IOException ex) {
                encodable = false;
            }

            if (encodable) {
                out.append(ch);
            } else {
                // substituições simples para manter legibilidade
                if (ch == '\u2022') {   // bullet real
                    out.append('*');
                } else {
                    out.append('?');
                }
            }
        }
        return out.toString();
    }

}
