package com.example.backend.controllers;

import java.util.Map;

import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.backend.entities.User;
import com.example.backend.repositories.UserRepository;
import com.example.backend.security.UserDetailsImpl;

import jakarta.transaction.Transactional;

@RestController
@RequestMapping("/api/admin")
public class AdminUserController {

    private final UserRepository userRepository;

    public AdminUserController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    // -------- USUÁRIOS --------

    @GetMapping("/users")
    public Page<UserDTO> listUsers(
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size,
        @RequestParam(defaultValue = "") String q,
        @RequestParam(required = false) String role,
        @RequestParam(required = false) Boolean enabled
    ) {
        Pageable pageable = PageRequest.of(Math.max(page, 0), Math.min(Math.max(size, 1), 100), Sort.by("id").descending());

        Page<User> base;
        if (q != null && !q.isBlank()) {
            base = userRepository.findByUsernameContainingIgnoreCaseOrEmailContainingIgnoreCase(q, q, pageable);
        } else {
            base = userRepository.findAll(pageable);
        }

        // filtros opcionais
        Page<User> filtered = base.map(u -> u);
        if (role != null && !role.isBlank()) {
            filtered = new PageImpl<>(
                filtered.stream().filter(u -> role.equalsIgnoreCase(u.getRole())).toList(),
                pageable,
                filtered.getTotalElements() // nota: para página filtrada em memória, o total pode divergir.
            );
        }
        if (enabled != null) {
            filtered = new PageImpl<>(
                filtered.stream().filter(u -> u.isEnabled() == enabled).toList(),
                pageable,
                filtered.getTotalElements()
            );
        }

        return filtered.map(UserDTO::from);
    }

    @GetMapping("/users/{id}")
    public ResponseEntity<UserDTO> getUser(@PathVariable Long id) {
        return userRepository.findById(id)
            .map(UserDTO::from)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @PatchMapping("/users/{id}")
    @Transactional
    public ResponseEntity<?> patchUser(
        @PathVariable Long id,
        @RequestBody UpdateUserReq req,
        @AuthenticationPrincipal UserDetailsImpl me
    ) {
        return userRepository.findById(id).map(u -> {
            // Não se auto-desabilitar nem se auto-demitir de admin sem cuidado
            boolean isSelf = me != null && me.getId() != null && me.getId().equals(u.getId());

            if (req.username != null && !req.username.isBlank()) {
                u.setUsername(req.username.trim());
            }
            if (req.role != null && !req.role.isBlank()) {
                String newRole = req.role.trim().toLowerCase();
                if (!newRole.equals("user") && !newRole.equals("admin")) {
                    return ResponseEntity.badRequest().body(Map.of("error", "role deve ser 'user' ou 'admin'"));
                }
                if (isSelf && !newRole.equalsIgnoreCase(me.getRole())) {
                    // Evita que o admin se rebaixe a 'user' por engano
                    return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("error", "Não é permitido alterar sua própria role nesta operação."));
                }
                u.setRole(newRole);
            }
            if (req.enabled != null) {
                if (isSelf && !req.enabled) {
                    return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("error", "Você não pode desativar sua própria conta."));
                }
                u.setEnabled(req.enabled);
            }

            return ResponseEntity.ok(UserDTO.from(u));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/users/{id}")
    @Transactional
    public ResponseEntity<?> deleteUser(
        @PathVariable Long id,
        @AuthenticationPrincipal UserDetailsImpl me
    ) {
        if (me != null && me.getId() != null && me.getId().equals(id)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(Map.of("error", "Você não pode excluir sua própria conta."));
        }
        try {
            userRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        } catch (EmptyResultDataAccessException ex) {
            return ResponseEntity.notFound().build();
        }
    }

    // -------- DOCUMENTOS (GANCHO) --------
    // Se você JÁ tem entidade/serviço de "registros de tradução",
    // implemente aqui endpoints que filtram por userId.
    // Exemplo (ajuste nomes se sua entidade/service tiver outro nome):
    //
    // @GetMapping("/users/{id}/records")
    // public Page<TranslationRecordDTO> recordsByUser(
    //     @PathVariable Long id,
    //     @RequestParam(defaultValue="0") int page,
    //     @RequestParam(defaultValue="20") int size
    // ) { ... }
    //
    // @DeleteMapping("/users/{id}/records/{recordId}")
    // public ResponseEntity<?> deleteRecord(@PathVariable Long id, @PathVariable Long recordId) { ... }

    // ====== DTOs ======
    public static class UserDTO {
        public Long id;
        public String username;
        public String email;
        public String role;
        public boolean enabled;

        public static UserDTO from(User u) {
            UserDTO d = new UserDTO();
            d.id = u.getId();
            d.username = u.getUsername();
            d.email = u.getEmail();
            d.role = u.getRole();
            d.enabled = u.isEnabled();
            return d;
        }
    }

    public static class UpdateUserReq {
        public String username;
        public String role;     // "user" | "admin"
        public Boolean enabled;
    }
}
