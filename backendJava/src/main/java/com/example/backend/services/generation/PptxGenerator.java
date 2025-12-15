package com.example.backend.services.generation;

import java.awt.geom.Rectangle2D;
import java.io.ByteArrayOutputStream;
import java.io.IOException;

import org.apache.poi.xslf.usermodel.XMLSlideShow;
import org.apache.poi.xslf.usermodel.XSLFSlide;
import org.apache.poi.xslf.usermodel.XSLFTextBox;
import org.springframework.stereotype.Service;

@Service
public class PptxGenerator {
  public byte[] generateFromPlainText(String text) {
    try (XMLSlideShow ppt = new XMLSlideShow();
         ByteArrayOutputStream baos = new ByteArrayOutputStream()) {

      XSLFSlide slide = ppt.createSlide();
      XSLFTextBox box = slide.createTextBox();
      box.setAnchor(new Rectangle2D.Double(50, 50, 620, 450));
      box.setText(text);

      ppt.write(baos);
      return baos.toByteArray();
    } catch (IOException e) {
      throw new RuntimeException("Falha ao gerar PPTX", e);
    }
  }
}
