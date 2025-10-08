package com.example.backend.folders;

import com.example.backend.common.BadRequestException;
import com.example.backend.common.NotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
@RequiredArgsConstructor
public class FolderService {

    private final FolderRepository repo;

    @Transactional
    public Folder create(UUID userId, UUID parentId, String name) {
        name = validateName(name);
        Folder parent = null; int depth = 0; String basePath = "/";

        if (parentId != null) {
            parent = repo.findByIdAndUserId(parentId, userId)
                    .orElseThrow(() -> new NotFoundException("Parent folder"));
            depth = parent.getDepth() + 1;
            basePath = parent.getPath();
        }

        if (repo.existsSiblingName(userId, parentId, name))
            throw new BadRequestException("Folder name already exists in this location");

        Folder f = new Folder();
        f.setUserId(userId);
        f.setParent(parent);
        f.setName(name);
        f.setDepth(depth);

        // Primeiro salva para gerar ID
        repo.saveAndFlush(f);

        f.setPath(basePath + f.getId() + "/");
        return repo.save(f);
    }

    @Transactional(readOnly = true)
    public Page<Folder> listChildren(UUID userId, UUID parentId, Pageable pageable) {
        return repo.findChildren(userId, parentId, pageable);
    }

    @Transactional
    public Folder rename(UUID userId, UUID folderId, String newName) {
        newName = validateName(newName);
        Folder f = repo.findByIdAndUserId(folderId, userId)
                .orElseThrow(() -> new NotFoundException("Folder"));

        UUID parentId = (f.getParent() == null ? null : f.getParent().getId());
        if (repo.existsSiblingName(userId, parentId, newName))
            throw new BadRequestException("Folder name already exists in this location");

        f.setName(newName);
        return repo.save(f);
    }

    @Transactional
    public void delete(UUID userId, UUID folderId, boolean soft) {
        Folder f = repo.findByIdAndUserId(folderId, userId)
                .orElseThrow(() -> new NotFoundException("Folder"));

        if (soft) {
            // marca toda a subárvore como deletada
            String prefix = f.getPath();
            List<Folder> subtree = repo.findSubtree(userId, prefix);
            var now = java.time.Instant.now();
            for (Folder ch : subtree) ch.setDeletedAt(now);
            f.setDeletedAt(now);
            repo.save(f);
            repo.saveAll(subtree);
        } else {
            repo.delete(f); // ON DELETE CASCADE remove filhos
        }
    }

    @Transactional
    public void move(UUID userId, UUID folderId, UUID newParentId) {
        if (Objects.equals(folderId, newParentId))
            throw new BadRequestException("Cannot move a folder into itself");

        Folder folder = repo.findByIdAndUserId(folderId, userId)
                .orElseThrow(() -> new NotFoundException("Folder"));
        Folder target = repo.findByIdAndUserId(newParentId, userId)
                .orElseThrow(() -> new NotFoundException("Target folder"));

        // impedir mover para um descendente
        String oldPrefix = folder.getPath();
        if ((target.getPath() + "").startsWith(oldPrefix))
            throw new BadRequestException("Cannot move into a descendant");

        // nome duplicado sob o novo pai?
        if (repo.existsSiblingName(userId, target.getId(), folder.getName()))
            throw new BadRequestException("A folder with the same name already exists in target");

        String newPrefixOfSelf = target.getPath() + folder.getId() + "/";
        int depthDelta = (target.getDepth() + 1) - folder.getDepth();

        // atualiza raiz
        folder.setParent(target);
        folder.setDepth(folder.getDepth() + depthDelta);
        folder.setPath(newPrefixOfSelf);
        repo.save(folder);

        // atualiza subárvore
        List<Folder> subtree = repo.findSubtree(userId, oldPrefix);
        for (Folder ch : subtree) {
            ch.setDepth(ch.getDepth() + depthDelta);
            ch.setPath(ch.getPath().replaceFirst(java.util.regex.Pattern.quote(oldPrefix), newPrefixOfSelf));
        }
        repo.saveAll(subtree);
    }

    private String validateName(String name) {
        if (name == null) throw new BadRequestException("Name is required");
        String n = name.trim();
        if (n.isEmpty()) throw new BadRequestException("Name cannot be empty");
        if (n.length() > 255) throw new BadRequestException("Name too long");
        if (n.contains("/")) throw new BadRequestException("Name cannot contain '/'");
        return n;
    }
}