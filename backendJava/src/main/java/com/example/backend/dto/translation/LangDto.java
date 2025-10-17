package com.example.backend.dto.translation;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LangDto {
    private String code;  // en, pt, es...
    private String name;  // English, Portuguese, ...
}
