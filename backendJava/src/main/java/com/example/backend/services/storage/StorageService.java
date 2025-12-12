package com.example.backend.services.storage;

import java.nio.file.Path;

import org.springframework.web.multipart.MultipartFile;

public interface StorageService {
  Path saveUpload(MultipartFile file);
  Path saveOutput(String filename, byte[] bytes);
}
