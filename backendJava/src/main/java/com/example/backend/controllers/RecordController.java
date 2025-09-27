package com.example.backend.controllers;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import com.example.backend.dto.translation.RecordDto;
import com.example.backend.dto.translation.LangDto;
import com.example.backend.services.translation.LanguageService;
import com.example.backend.services.translation.TranslationRecordService;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
public class RecordController {

  private final TranslationRecordService recordService;
  private final LanguageService languageService;

  // GET /records
  @GetMapping("/records")
  public ResponseEntity<List<RecordDto>> listRecords(Authentication auth) {
    Long userId = null;
    if (auth != null && auth.isAuthenticated() && auth.getPrincipal() instanceof com.example.backend.security.UserDetailsImpl u) {
      userId = u.getId();
    }
    return ResponseEntity.ok(recordService.listForUser(userId));
  }

  // DELETE /records/{id}
  @DeleteMapping("/records/{id}")
  public ResponseEntity<Void> deleteRecord(@PathVariable Long id, Authentication auth) {
    Long userId = null;
    if (auth != null && auth.isAuthenticated() && auth.getPrincipal() instanceof com.example.backend.security.UserDetailsImpl u) {
      userId = u.getId();
    }
    recordService.deleteForUser(id, userId);
    return ResponseEntity.noContent().build();
  }

  // GET /languages
  @GetMapping("/languages")
  public ResponseEntity<List<LangDto>> languages() {
    return ResponseEntity.ok(languageService.list());
  }
}
