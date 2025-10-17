package com.example.backend.services.translation;

import org.springframework.web.multipart.MultipartFile;

public interface TranslationService {
    String translate(MultipartFile file, String sourceLang, String targetLang, String username);
}
