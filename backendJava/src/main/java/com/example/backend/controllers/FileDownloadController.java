package com.example.backend.controllers;

import java.nio.file.Files;
import java.nio.file.Path;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class FileDownloadController {

  @Value("${app.storage.output-dir:./data/outputs}")
  private String outputDir;

  @GetMapping("/files/{fileName:.+}")
  public ResponseEntity<ByteArrayResource> download(@PathVariable String fileName) throws Exception {
    // prevenção simples contra path traversal
    if (fileName.contains("..") || fileName.contains("/") || fileName.contains("\\")) {
      return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
    }

    Path path = Path.of(outputDir).resolve(fileName).normalize();
    if (!Files.exists(path) || !Files.isRegularFile(path)) {
      return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
    }

    byte[] bytes = Files.readAllBytes(path);
    ByteArrayResource res = new ByteArrayResource(bytes);

    String contentType = Files.probeContentType(path);
    if (contentType == null) contentType = "application/octet-stream";

    return ResponseEntity.ok()
        .contentType(MediaType.parseMediaType(contentType))
        .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + path.getFileName().toString() + "\"")
        .contentLength(bytes.length)
        .body(res);
  }
}
