package com.example.backend.services.translation;

import java.util.List;

import com.example.backend.dto.translation.RecordDto;
import com.example.backend.entities.TranslationRecord;

public interface TranslationRecordService {
  TranslationRecord save(TranslationRecord rec);
  List<RecordDto> listForUser(Long userId);
  void deleteForUser(Long id, Long userId);
}
