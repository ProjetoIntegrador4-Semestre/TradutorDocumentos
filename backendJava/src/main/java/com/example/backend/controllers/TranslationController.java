package com.example.backend.controllers;

import java.util.Map;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.example.backend.dto.translation.TranslateResponse;
import com.example.backend.services.translation.TranslationService;

import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
public class TranslationController {

    private final TranslationService translationService;

    @PostMapping(value = "/translate-file", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @SecurityRequirement(name = "bearerAuth") 
    public ResponseEntity<?> translate(
            @RequestPart("file") MultipartFile file,
            @RequestParam(value = "source_lang", required = false) String sourceLang,
            @RequestParam("target_lang") String targetLang,
            Authentication authentication
    ) {
        try {
            String username = authentication.getName();
            String out = translationService.translate(file, sourceLang, targetLang, username);
            return ResponseEntity.ok(new TranslateResponse(out, "/files/" + out));
        } catch (Exception e) {
            e.printStackTrace(); // aparece nos logs do container
            return ResponseEntity.status(500).body(Map.of(
                    "error", e.getClass().getSimpleName(),
                    "message", e.getMessage()
            ));
        }
    }

    /** Handler genérico para capturar exceções não tratadas */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<?> handleError(Exception e) {
        e.printStackTrace();
        return ResponseEntity.status(500).body(Map.of(
                "error", e.getClass().getSimpleName(),
                "message", e.getMessage()
        ));
    }
}
