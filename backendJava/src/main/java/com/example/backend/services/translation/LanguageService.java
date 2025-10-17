package com.example.backend.services.translation;

import java.util.List;
import com.example.backend.dto.translation.LangDto;

public interface LanguageService {
  List<LangDto> list();
}
