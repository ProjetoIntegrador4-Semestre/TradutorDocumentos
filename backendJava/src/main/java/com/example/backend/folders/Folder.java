package com.example.backend.folders;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.SQLRestriction;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "folders")
@Getter @Setter
@SQLRestriction("deleted_at IS NULL") // evita listar deletados por padrão
public class Folder {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_id")
    private Folder parent;

    @Column(nullable = false, length = 255)
    private String name;

    @Column(nullable = false, columnDefinition = "text")
    private String path; // /<rootId>/<childId>/

    @Column(nullable = false)
    private int depth;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt = Instant.now();

    @Column(name = "deleted_at")
    private Instant deletedAt;

    @PreUpdate
    void onUpdate() { this.updatedAt = Instant.now(); }
}