package com.example.backend.folders.dto;

import java.util.UUID;

public record CreateFolderDto(UUID parentId, String name) {}
