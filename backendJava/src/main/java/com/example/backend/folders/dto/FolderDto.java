package com.example.backend.folders.dto;

import com.example.backend.folders.Folder;

import java.time.Instant;
import java.util.UUID;

public record FolderDto(
        UUID id, UUID parentId, String name, String path, int depth,
        Instant createdAt, Instant updatedAt
) {
    public static FolderDto from(Folder f) {
        return new FolderDto(
                f.getId(),
                f.getParent() == null ? null : f.getParent().getId(),
                f.getName(),
                f.getPath(),
                f.getDepth(),
                f.getCreatedAt(),
                f.getUpdatedAt()
        );
    }
}