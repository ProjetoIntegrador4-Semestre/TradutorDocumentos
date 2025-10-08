package com.example.backend.folders.dto;

import org.springframework.data.domain.Page;

import java.util.List;

public record ListChildrenResponse(
        List<FolderDto> folders,
        int page, int size, long totalElements, int totalPages
) {
    public static ListChildrenResponse from(Page<FolderDto> pageObj) {
        return new ListChildrenResponse(
                pageObj.getContent(),
                pageObj.getNumber(),
                pageObj.getSize(),
                pageObj.getTotalElements(),
                pageObj.getTotalPages()
        );
    }
}