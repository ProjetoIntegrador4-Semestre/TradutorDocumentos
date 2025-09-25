package com.example.backend.controllers;

import java.nio.file.Path;
import java.nio.file.Paths;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.FileSystemResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/files")
public class FileController {

  @Value("${app.storage.output-dir}")
  private String outputDir;

  @GetMapping("/{filename}")
  public ResponseEntity<FileSystemResource> download(@PathVariable String filename) {
    Path file = Paths.get(outputDir).resolve(filename).normalize();
    FileSystemResource res = new FileSystemResource(file);
    if (!res.exists()) return ResponseEntity.notFound().build();

    return ResponseEntity.ok()
        .contentType(MediaType.APPLICATION_OCTET_STREAM)
        .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
        .body(res);
  }
}

