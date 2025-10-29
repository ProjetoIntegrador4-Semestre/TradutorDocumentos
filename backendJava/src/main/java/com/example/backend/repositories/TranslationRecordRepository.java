package com.example.backend.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import com.example.backend.entities.TranslationRecord;

public interface TranslationRecordRepository extends JpaRepository<TranslationRecord, Long> {

  @Modifying
    @Query("delete from TranslationRecord r where r.user.id = :userId")
    int deleteByUserId(Long userId);

  List<TranslationRecord> findAllByUser_IdOrderByCreatedAtDesc(Long userId);


  @Modifying(clearAutomatically = true, flushAutomatically = true)
  @Transactional
  @Query("delete from TranslationRecord tr where tr.id = :id and tr.user.id = :userId")
  int deleteOwned(@Param("id") Long id, @Param("userId") Long userId);
}
