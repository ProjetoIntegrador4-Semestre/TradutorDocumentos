package com.example.backend.services.translation;

import java.util.List;

import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import com.example.backend.dto.translation.LangDto;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class LanguageServiceImpl implements LanguageService {

  private final RestClient restClient;

  private record LibreLang(String code, String name) {}

  @Override
  public List<LangDto> list() {
    List<LibreLang> langs = restClient.get()
        .uri("/languages")
        .retrieve()
        .body(new ParameterizedTypeReference<List<LibreLang>>() {});

    // Converte para seu DTO
    return langs.stream()
        .map(l -> new LangDto(l.code(), l.name()))
        .toList();
  }
}
