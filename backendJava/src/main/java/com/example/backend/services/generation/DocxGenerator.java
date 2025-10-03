package com.example.backend.services.generation;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.math.BigInteger;              // <-- IMPORT NECESSÁRIO
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.apache.poi.xwpf.usermodel.UnderlinePatterns;
import org.apache.poi.xwpf.usermodel.XWPFAbstractNum;
import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.apache.poi.xwpf.usermodel.XWPFHyperlinkRun;
import org.apache.poi.xwpf.usermodel.XWPFNumbering;
import org.apache.poi.xwpf.usermodel.XWPFParagraph;
import org.apache.poi.xwpf.usermodel.XWPFRun;
import org.openxmlformats.schemas.wordprocessingml.x2006.main.CTAbstractNum;
import org.openxmlformats.schemas.wordprocessingml.x2006.main.CTLvl;
import org.openxmlformats.schemas.wordprocessingml.x2006.main.CTPPr;
import org.openxmlformats.schemas.wordprocessingml.x2006.main.CTSpacing;
import org.openxmlformats.schemas.wordprocessingml.x2006.main.STLineSpacingRule;
import org.openxmlformats.schemas.wordprocessingml.x2006.main.STNumberFormat;
import org.springframework.stereotype.Service;

@Service
public class DocxGenerator {

  private static final String[] FONT_PREFERENCES = {
      "DejaVu Sans",
      "Calibri",
      "Arial Unicode MS",
      "Arial"
  };
  private static final int FONT_SIZE = 12;     // pt
  private static final int SPACE_AFTER = 120;  // twips (~6pt)

  private static final Pattern URL = Pattern.compile("(https?://\\S+)", Pattern.CASE_INSENSITIVE);

  public byte[] generateFromPlainText(String text) {
    try (XWPFDocument doc = new XWPFDocument();
         ByteArrayOutputStream baos = new ByteArrayOutputStream()) {

      BigInteger numIdBullets = createBulletNumbering(doc);

      List<String> paragraphs = List.of(text.split("\\R\\s*\\R"));

      for (String rawPara : paragraphs) {
        String para = normalizeWhitespace(rawPara.trim());

        if (para.isEmpty()) {
          addEmptyParagraph(doc);
          continue;
        }

        if (isBulletLine(para)) {
          for (String line : para.split("\\R")) {
            String item = stripBulletMarker(line.trim());
            XWPFParagraph p = doc.createParagraph();
            p.setNumID(numIdBullets);
            setParagraphSpacing(p);
            addRunsWithLinks(p, item);
          }
        } else {
          XWPFParagraph p = doc.createParagraph();
          setParagraphSpacing(p);
          addRunsWithLinks(p, para, true);
        }
      }

      // Removido setDocumentDefaultFont(): POI 5.3.0 não expõe APIs usadas.
      // A fonte é definida em cada run por applyFont(run).

      doc.write(baos);
      return baos.toByteArray();
    } catch (IOException e) {
      throw new RuntimeException("Falha ao gerar DOCX", e);
    }
  }

  // ---------- helpers --------------------------------------------------------

  private void addEmptyParagraph(XWPFDocument doc) {
    XWPFParagraph p = doc.createParagraph();
    setParagraphSpacing(p);
    XWPFRun r = p.createRun();
    applyFont(r);
    r.setText("");
  }

  private boolean isBulletLine(String s) {
    String[] lines = s.split("\\R");
    int count = 0;
    for (String l : lines) {
      String t = l.trim();
      if (t.startsWith("- ") || t.startsWith("* ") || t.startsWith("• ")) count++;
    }
    return count > 0 && count == lines.length;
  }

  private String stripBulletMarker(String s) {
    String t = s.trim();
    if (t.startsWith("- ") || t.startsWith("* ") || t.startsWith("• ")) {
      return t.substring(2).trim();
    }
    return t;
  }

  private void addRunsWithLinks(XWPFParagraph p, String text) {
    addRunsWithLinks(p, text, false);
  }

  private void addRunsWithLinks(XWPFParagraph p, String text, boolean preserveInnerBreaks) {
    if (preserveInnerBreaks && text.contains("\n")) {
      String[] parts = text.split("\\R", -1);
      for (int i = 0; i < parts.length; i++) {
        addRunsWithLinksSingleLine(p, parts[i]);
        if (i < parts.length - 1) {
          XWPFRun br = p.createRun();
          applyFont(br);
          br.addBreak();
        }
      }
    } else {
      addRunsWithLinksSingleLine(p, text);
    }
  }

  private void addRunsWithLinksSingleLine(XWPFParagraph p, String line) {
    Matcher m = URL.matcher(line);
    int last = 0;
    while (m.find()) {
      if (m.start() > last) {
        XWPFRun r = p.createRun();
        applyFont(r);
        r.setText(line.substring(last, m.start()));
      }
      String url = m.group(1);
      XWPFHyperlinkRun hr = p.createHyperlinkRun(url);
      applyFont(hr);
      hr.setColor("0563C1");
      hr.setUnderline(UnderlinePatterns.SINGLE);
      hr.setText(url);
      last = m.end();
    }
    if (last < line.length()) {
      XWPFRun r = p.createRun();
      applyFont(r);
      r.setText(line.substring(last));
    }
  }

  private void setParagraphSpacing(XWPFParagraph p) {
    CTPPr ppr = p.getCTP().isSetPPr() ? p.getCTP().getPPr() : p.getCTP().addNewPPr();
    CTSpacing spacing = ppr.isSetSpacing() ? ppr.getSpacing() : ppr.addNewSpacing();
    spacing.setAfter(BigInteger.valueOf(SPACE_AFTER));
    spacing.setLineRule(STLineSpacingRule.AUTO);
  }

  private void applyFont(XWPFRun run) {
    // define a primeira preferida; o Word substitui se não existir
    run.setFontFamily(FONT_PREFERENCES[0]);
    run.setFontSize(FONT_SIZE);
  }

  private BigInteger createBulletNumbering(XWPFDocument doc) {
    XWPFNumbering numbering = doc.createNumbering();

    CTAbstractNum cta = CTAbstractNum.Factory.newInstance();
    cta.setAbstractNumId(BigInteger.valueOf(1));
    CTLvl lvl = cta.addNewLvl();
    lvl.setIlvl(BigInteger.ZERO);
    lvl.addNewNumFmt().setVal(STNumberFormat.BULLET);
    lvl.addNewLvlText().setVal("•");
    lvl.addNewStart().setVal(BigInteger.ONE);

    XWPFAbstractNum abs = new XWPFAbstractNum(cta);
    BigInteger absId = numbering.addAbstractNum(abs);
    return numbering.addNum(absId);
  }

  private String normalizeWhitespace(String s) {
    String t = s.replace('\u00A0', ' ').replaceAll("[ \\t\\x0B\\f\\r]+", " ");
    t = t.replaceAll(" \\,", ",").replaceAll(" \\.", ".").replaceAll(" \\;", ";").replaceAll(" \\:", ":");
    t = t.replaceAll(",(?=\\S)", ", ");
    return t.trim();
  }
}
