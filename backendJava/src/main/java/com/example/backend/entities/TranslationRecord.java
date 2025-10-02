package com.example.backend.entities;

import java.time.Instant;

import org.hibernate.annotations.CreationTimestamp;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "translation_records")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class TranslationRecord {

  @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(name = "original_filename", length = 255, nullable = false)
  private String originalFilename;

  @Column(name = "file_type", length = 10, nullable = false)
  private String fileType;               // PDF, DOCX, PPTX, etc.

  @Column(name = "detected_lang", length = 8)
  private String detectedLang;

  @Column(name = "target_lang", length = 8, nullable = false)
  private String targetLang;

  @Column(name = "file_size_bytes")
    private Long fileSizeBytes;   

  @Column(name = "output_path", length = 512)
  private String outputPath;             // caminho do arquivo gerado (ex.: data/outputs/xxx.txt)

  @CreationTimestamp
  @Column(name = "created_at", updatable = false)
  private Instant createdAt;

  // opcional: atrelar ao usuário autenticado
  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "user_id")
  private User user; // use sua entidade User
}
