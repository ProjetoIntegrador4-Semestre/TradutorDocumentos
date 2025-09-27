package com.example.backend.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.backend.entities.TranslationRecord;

public interface TranslationRecordRepository extends JpaRepository<TranslationRecord, Long> {
  List<TranslationRecord> findAllByUser_IdOrderByCreatedAtDesc(Long userId);
  void deleteByIdAndUser_Id(Long id, Long userId);
}
