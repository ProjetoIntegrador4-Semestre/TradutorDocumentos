package com.example.backend.folders;

import com.example.backend.folders.dto.*;
import com.example.backend.security.CurrentUser;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/folders")
@RequiredArgsConstructor
public class FolderController {

    private final FolderService service;

    @PostMapping
    public FolderDto create(@RequestBody CreateFolderDto dto) {
        UUID userId = CurrentUser.id();
        var f = service.create(userId, dto.parentId(), dto.name());
        return FolderDto.from(f);
    }

    @GetMapping("/{id}/children")
    public ListChildrenResponse listChildren(@PathVariable(required = false) UUID id,
                                             @RequestParam(defaultValue = "0") int page,
                                             @RequestParam(defaultValue = "30") int size,
                                             @RequestParam(defaultValue = "name") String sort,
                                             @RequestParam(defaultValue = "asc") String order) {
        UUID userId = CurrentUser.id();
        Sort.Direction dir = "desc".equalsIgnoreCase(order) ? Sort.Direction.DESC : Sort.Direction.ASC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(dir, sort));
        var folders = service.listChildren(userId, id, pageable).map(FolderDto::from);
        return ListChildrenResponse.from(folders);
    }

    @PatchMapping("/{id}/rename")
    public FolderDto rename(@PathVariable UUID id, @RequestBody RenameFolderDto dto) {
        UUID userId = CurrentUser.id();
        return FolderDto.from(service.rename(userId, id, dto.name()));
    }

    @PostMapping("/{id}/move")
    public void move(@PathVariable UUID id, @RequestBody MoveFolderDto dto) {
        UUID userId = CurrentUser.id();
        service.move(userId, id, dto.targetFolderId());
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable UUID id, @RequestParam(defaultValue = "true") boolean soft) {
        UUID userId = CurrentUser.id();
        service.delete(userId, id, soft);
    }
}