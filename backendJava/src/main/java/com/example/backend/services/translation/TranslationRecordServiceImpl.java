package com.example.backend.services.translation;

import java.util.List;

import org.springframework.stereotype.Service;

import com.example.backend.dto.translation.RecordDto;
import com.example.backend.entities.TranslationRecord;
import com.example.backend.repositories.TranslationRecordRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class TranslationRecordServiceImpl implements TranslationRecordService {

  private final TranslationRecordRepository repo;

  @Override
  public TranslationRecord save(TranslationRecord rec) {
    return repo.save(rec);
  }

  @Override
  public List<RecordDto> listForUser(Long userId) {
    var list = (userId == null)
        ? repo.findAll() // se quiser listar tudo quando não autenticado (ou troque para vazio)
        : repo.findAllByUser_IdOrderByCreatedAtDesc(userId);
    return list.stream().map(r -> RecordDto.builder()
        .id(r.getId())
        .originalFilename(r.getOriginalFilename())
        .fileType(r.getFileType())
        .detectedLang(r.getDetectedLang())
        .targetLang(r.getTargetLang())
        .createdAt(r.getCreatedAt())
        .downloadUrl(r.getOutputPath() == null ? null : "/files/" + r.getOutputPath().substring(r.getOutputPath().lastIndexOf('/') + 1))
        .build()
    ).toList();
  }

  @Override
  public void deleteForUser(Long id, Long userId) {
    if (userId == null) {
      repo.deleteById(id); // cuidado: em prod prefira exigir user
    } else {
      repo.deleteByIdAndUser_Id(id, userId);
    }
  }
}
