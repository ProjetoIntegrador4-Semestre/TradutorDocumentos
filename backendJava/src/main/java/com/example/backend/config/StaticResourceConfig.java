package com.example.backend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class StaticResourceConfig implements WebMvcConfigurer {

  @Value("${app.storage.output-dir:./data/outputs}")
  private String outputDir;

  @Override
  public void addResourceHandlers(ResourceHandlerRegistry registry) {
    // garante prefixo file:
    String location = "file:" + (outputDir.endsWith("/") || outputDir.endsWith("\\")
        ? outputDir
        : outputDir + "/");

    // /files/** -> <outputDir>/*
    registry.addResourceHandler("/files/**")
            .addResourceLocations(location)
            .setCachePeriod(0);
  }
}
