package com.example.backend.services.translation;

import java.io.ByteArrayOutputStream;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Optional;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import static org.assertj.core.api.Assertions.assertThat;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.api.io.TempDir;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.ArgumentMatchers.eq;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;

import com.example.backend.entities.TranslationRecord;
import com.example.backend.repositories.UserRepository;
import com.example.backend.services.generation.DocxGenerator;
import com.example.backend.services.generation.PdfGenerator;
import com.example.backend.services.generation.PptxGenerator;
import com.example.backend.services.storage.StorageService;

@ExtendWith(MockitoExtension.class)
class TranslationServiceImplTest {

  @Mock StorageService storage;
  @Mock LibreTranslateService mt;
  @Mock TranslationRecordService recordService;
  @Mock UserRepository userRepo;
  @Mock DocxGenerator docx;
  @Mock PptxGenerator pptx; // avisos de "unused" são OK em testes
  @Mock PdfGenerator pdf;

  @InjectMocks TranslationServiceImpl service;

  @TempDir Path tmp;

  @Test
  void translate_callsDetectWhenSourceEmpty_andGeneratesPdf() throws Exception {
    // arquivo PDF válido salvo no disco (a extração usa PDFBox)
    Path uploaded = tmp.resolve("upload.pdf");
    createValidPdf(uploaded, "Hello PDF");

    // Multipart (o conteúdo em si não é usado após o saveUpload)
    var file = new MockMultipartFile("f", "report.pdf", "application/pdf", new byte[0]);

    // storage.saveUpload -> indica onde foi salvo
    when(storage.saveUpload(file)).thenReturn(uploaded);

    // fluxo de tradução
    when(mt.detectLanguage(anyString())).thenReturn("en");
    when(mt.translateLargeText(anyString(), eq("en"), eq("pt"))).thenReturn("Olá mundo");
    when(pdf.generateFromPlainText("Olá mundo")).thenReturn("PDF_OUT".getBytes());

    // saveOutput
    Path out = tmp.resolve("report.pt.pdf");
    when(storage.saveOutput(eq("report.pt.pdf"), any())).thenReturn(out);

    // usuário inexistente (opcional)
    when(userRepo.findByEmail("samuel@example.com")).thenReturn(Optional.empty());

    // quando
    String outName = service.translate(file, "", "pt", "samuel@example.com");

    // então
    assertThat(outName).isEqualTo("report.pt.pdf");
    verify(mt).detectLanguage(anyString());
    verify(mt).translateLargeText(anyString(), eq("en"), eq("pt"));
    verify(pdf).generateFromPlainText("Olá mundo");
    verify(recordService).save(argThat((TranslationRecord r) ->
        r.getOriginalFilename().equals("report.pdf") &&
        r.getDetectedLang().equals("en") &&
        r.getTargetLang().equals("pt") &&
        r.getFileType().equals("PDF") &&
        r.getOutputPath().contains("report.pt.pdf")
    ));
  }

  @Test
  void translate_skipsDetect_whenSourceProvided_andUsesDocxGenerator() throws Exception {
    // DOCX mínimo válido (ZIP com word/document.xml)
    Path uploaded = tmp.resolve("doc.docx");
    createMinimalDocx(uploaded, "Hello DOCX");

    var file = new MockMultipartFile(
        "f",
        "doc.docx",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        new byte[0]
    );

    when(storage.saveUpload(file)).thenReturn(uploaded);
    when(mt.translateLargeText(anyString(), eq("en"), eq("pt"))).thenReturn("traduzido");
    when(docx.generateFromPlainText("traduzido")).thenReturn("DOCX_OUT".getBytes());
    when(storage.saveOutput(eq("doc.pt.docx"), any())).thenReturn(tmp.resolve("doc.pt.docx"));

    service.translate(file, "en", "pt", "user@example.com");

    verify(mt, never()).detectLanguage(anyString());
    verify(docx).generateFromPlainText("traduzido");
  }

  // ----------------- helpers -----------------

  private static void createValidPdf(Path target, String text) throws Exception {
    try (PDDocument doc = new PDDocument()) {
      PDPage page = new PDPage();
      doc.addPage(page);
      try (PDPageContentStream cs = new PDPageContentStream(doc, page)) {
        cs.beginText();
        cs.setFont(PDType1Font.HELVETICA, 12);
        cs.newLineAtOffset(50, 750);
        cs.showText(text);
        cs.endText();
      }
      doc.save(target.toFile());
    }
  }

  private static void createMinimalDocx(Path target, String paragraph) throws Exception {
    // Cria um ZIP com a estrutura mínima e um document.xml simples
    byte[] documentXml = (
        "<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\"?>" +
        "<w:document xmlns:w=\"http://schemas.openxmlformats.org/wordprocessingml/2006/main\">" +
        "  <w:body>" +
        "    <w:p><w:r><w:t>" + escapeXml(paragraph) + "</w:t></w:r></w:p>" +
        "  </w:body>" +
        "</w:document>"
    ).getBytes(StandardCharsets.UTF_8);

    ByteArrayOutputStream baos = new ByteArrayOutputStream();
    try (ZipOutputStream zos = new ZipOutputStream(baos)) {
      // [Content_Types].xml (mínimo)
      zos.putNextEntry(new ZipEntry("[Content_Types].xml"));
      zos.write((
          "<?xml version=\"1.0\" encoding=\"UTF-8\"?>" +
          "<Types xmlns=\"http://schemas.openxmlformats.org/package/2006/content-types\">" +
          "<Default Extension=\"rels\" ContentType=\"application/vnd.openxmlformats-package.relationships+xml\"/>" +
          "<Default Extension=\"xml\" ContentType=\"application/xml\"/>" +
          "<Override PartName=\"/word/document.xml\" ContentType=\"application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml\"/>" +
          "</Types>"
      ).getBytes(StandardCharsets.UTF_8));
      zos.closeEntry();

      // word/document.xml
      zos.putNextEntry(new ZipEntry("word/document.xml"));
      zos.write(documentXml);
      zos.closeEntry();

      // _rels/.rels (mínimo)
      zos.putNextEntry(new ZipEntry("_rels/.rels"));
      zos.write((
          "<?xml version=\"1.0\" encoding=\"UTF-8\"?>" +
          "<Relationships xmlns=\"http://schemas.openxmlformats.org/package/2006/relationships\">" +
          "<Relationship Id=\"rId1\" Type=\"http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument\" Target=\"/word/document.xml\"/>" +
          "</Relationships>"
      ).getBytes(StandardCharsets.UTF_8));
      zos.closeEntry();
    }
    Files.write(target, baos.toByteArray());
  }

  private static String escapeXml(String s) {
    return s.replace("&", "&amp;")
            .replace("<", "&lt;")
            .replace(">", "&gt;")
            .replace("\"", "&quot;")
            .replace("'", "&apos;");
  }
}