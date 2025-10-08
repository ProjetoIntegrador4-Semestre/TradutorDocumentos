package com.example.backend.folders;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface FolderRepository extends JpaRepository<Folder, UUID> {

    @Query("""
      select f from Folder f
       where f.userId = :userId and
             ((:parentId is null and f.parent is null) or (f.parent.id = :parentId))
       order by f.name asc
    """)
    Page<Folder> findChildren(@Param("userId") UUID userId,
                              @Param("parentId") UUID parentId,
                              Pageable pageable);

    Optional<Folder> findByIdAndUserId(UUID id, UUID userId);

    @Query("""
      select f from Folder f
       where f.userId = :userId and f.path like concat(:pathPrefix, '%')
    """)
    List<Folder> findSubtree(@Param("userId") UUID userId,
                             @Param("pathPrefix") String pathPrefix);

    @Query("""
      select count(f) > 0 from Folder f
       where f.userId = :userId
         and ((:parentId is null and f.parent is null) or (f.parent.id = :parentId))
         and lower(f.name) = lower(:name)
    """)
    boolean existsSiblingName(@Param("userId") UUID userId,
                              @Param("parentId") UUID parentId,
                              @Param("name") String name);
}