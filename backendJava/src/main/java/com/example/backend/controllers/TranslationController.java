package com.example.backend.controllers;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.example.backend.dto.translation.TranslateResponse;
import com.example.backend.services.translation.TranslationService;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
public class TranslationController {

  private final TranslationService translationService;

  @PostMapping(value="/translate-file", consumes=MediaType.MULTIPART_FORM_DATA_VALUE)
  public ResponseEntity<TranslateResponse> translate(
      @RequestPart("file") MultipartFile file,
      @RequestParam(value = "source_lang", required=false) String sourceLang,
      @RequestParam("target_lang") String targetLang
  ) {
    String out = translationService.translate(file, sourceLang, targetLang);
    return ResponseEntity.ok(new TranslateResponse(out, "/files/" + out));
  }
}
