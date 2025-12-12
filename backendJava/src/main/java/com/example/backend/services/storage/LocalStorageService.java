package com.example.backend.services.storage;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.nio.file.*;

@Service
public class LocalStorageService implements StorageService {

  private final Path uploadDir;
  private final Path outputDir;

  public LocalStorageService(
      @Value("${app.storage.upload-dir}") String upload,
      @Value("${app.storage.output-dir}") String output) throws IOException {
    this.uploadDir = Paths.get(upload).toAbsolutePath().normalize();
    this.outputDir = Paths.get(output).toAbsolutePath().normalize();
    Files.createDirectories(uploadDir);
    Files.createDirectories(outputDir);
  }

  @Override
  public Path saveUpload(MultipartFile file) {
    try {
      String clean = Path.of(file.getOriginalFilename()).getFileName().toString();
      Path target = uploadDir.resolve(System.currentTimeMillis() + "_" + clean);
      Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);
      return target;
    } catch (IOException e) {
      throw new RuntimeException("Failed to store upload", e);
    }
  }

  @Override
  public Path saveOutput(String filename, byte[] bytes) {
    try {
      Path target = outputDir.resolve(filename);
      Files.write(target, bytes, StandardOpenOption.CREATE, StandardOpenOption.TRUNCATE_EXISTING);
      return target;
    } catch (IOException e) {
      throw new RuntimeException("Failed to store output", e);
    }
  }
}
