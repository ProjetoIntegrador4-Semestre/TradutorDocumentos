package com.example.backend.controllers;

import java.util.Map;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import com.example.backend.entities.User;
import com.example.backend.repositories.UserRepository;
import com.example.backend.repositories.TranslationRecordRepository;
import com.example.backend.security.UserDetailsImpl;

@RestController
@RequestMapping("/api/admin")
public class AdminUserController {

    private final UserRepository userRepository;
    private final TranslationRecordRepository recordRepository; // <— novo

    public AdminUserController(UserRepository userRepository,
                               TranslationRecordRepository recordRepository) {
        this.userRepository = userRepository;
        this.recordRepository = recordRepository;
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

        Page<User> filtered = base.map(u -> u);
        if (role != null && !role.isBlank()) {
            filtered = new PageImpl<>(
                filtered.stream().filter(u -> role.equalsIgnoreCase(u.getRole())).toList(),
                pageable,
                filtered.getTotalElements()
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
        @AuthenticationPrincipal UserDetailsImpl me,
        @RequestParam(name = "force", defaultValue = "false") boolean force
    ) {
        if (me != null && me.getId() != null && me.getId().equals(id)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(Map.of("error", "Você não pode excluir sua própria conta."));
        }
        try {
            if (force) {
                // apaga documentos/regs do usuário antes
                recordRepository.deleteByUserId(id);
            }
            userRepository.deleteById(id);
            userRepository.flush(); // força o commit agora para capturar violação de integridade aqui
            return ResponseEntity.noContent().build();
        } catch (EmptyResultDataAccessException ex) {
            return ResponseEntity.notFound().build();
        } catch (DataIntegrityViolationException ex) {
            // ainda há vínculos; informe 409 (mais amigável que 500)
            return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(Map.of(
                    "error", "Usuário possui documentos/itens vinculados.",
                    "hint", "Exclua os documentos primeiro ou chame DELETE com ?force=true"
                ));
        }
    }

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
