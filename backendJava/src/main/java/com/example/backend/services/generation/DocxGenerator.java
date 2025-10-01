package com.example.backend.services.generation;

import java.io.ByteArrayOutputStream;
import java.io.IOException;

import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.apache.poi.xwpf.usermodel.XWPFParagraph;
import org.apache.poi.xwpf.usermodel.XWPFRun;
import org.springframework.stereotype.Service;

@Service
public class DocxGenerator {
  public byte[] generateFromPlainText(String text) {
    try (XWPFDocument doc = new XWPFDocument();
         ByteArrayOutputStream baos = new ByteArrayOutputStream()) {

      // cria parágrafos simples (1 por linha)
      String[] lines = text.split("\\R");
      for (String line : lines) {
        XWPFParagraph p = doc.createParagraph();
        XWPFRun r = p.createRun();
        r.setText(line);
      }

      doc.write(baos);
      return baos.toByteArray();
    } catch (IOException e) {
      throw new RuntimeException("Falha ao gerar DOCX", e);
    }
  }
}
