package com.example.backend.dto.translation;

import java.time.Instant;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class RecordDto {
  private Long id;
  private String originalFilename;
  private String fileType;
  private String detectedLang;
  private String targetLang;
  private Instant createdAt;
  private String downloadUrl; // ex.: /files/<nome>  (ou presigned no S3 futuramente)
}
