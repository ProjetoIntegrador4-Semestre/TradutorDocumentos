package com.example.backend.dto.translation;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class LangDto {
  private String code;  // en, pt, es...
  private String name;  // English, Portuguese, ...
}
