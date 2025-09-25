package com.example.backend;

import java.util.Set;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import com.example.backend.entity.Role;
import com.example.backend.entity.RoleName;
import com.example.backend.entity.User;
import com.example.backend.repositories.RoleRepository;
import com.example.backend.repositories.UserRepository;

@Component
public class DataInitializer implements CommandLineRunner {
    @Autowired
    private RoleRepository roleRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Override
    public void run(String... args) throws Exception {
        // Criar roles se não existirem
        if (roleRepository.findByName(RoleName.ROLE_USER).isEmpty()) {
            roleRepository.save(new Role(RoleName.ROLE_USER));
        }
        
        if (roleRepository.findByName(RoleName.ROLE_ADMIN).isEmpty()) {
            roleRepository.save(new Role(RoleName.ROLE_ADMIN));
        }
        
        // Criar usuário admin padrão se não existir
        if (userRepository.findByUsername("admin").isEmpty()) {
            User admin = new User("admin", passwordEncoder.encode("admin123"));
            Role adminRole = roleRepository.findByName(RoleName.ROLE_ADMIN).get();
            admin.setRoles(Set.of(adminRole));
            userRepository.save(admin);
        }
        
        // Criar usuário comum padrão se não existir
        if (userRepository.findByUsername("user").isEmpty()) {
            User user = new User("user", passwordEncoder.encode("user123"));
            Role userRole = roleRepository.findByName(RoleName.ROLE_USER).get();
            user.setRoles(Set.of(userRole));
            userRepository.save(user);
        }
    }
}