package com.todus.User;


import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import com.todus.image.Image;
import com.todus.image.ImageRepository;

import jakarta.transaction.Transactional;


@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/user")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ImageRepository imageRepository;
   
    @GetMapping("/profile")
    public ResponseEntity<?> getUserProfile() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).body("Usuario no autenticado");
        }

        User user = (User) authentication.getPrincipal();

        return ResponseEntity.ok(new UserProfileDTO(
            user.getName(),
            user.getSurname(),
            user.getNickname(),
            user.getEmail(),
            user.getImage() != null ? user.getImage().getId() : null,
            user.getImage() != null ? user.getImage().getImageUrl() : null
        ));
    }

    @PutMapping("/update")
    @Transactional
    public ResponseEntity<?> updateUser(@RequestBody UserProfileDTO updateUserDTO) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Usuario no autenticado");
        }

        User authenticatedUser = (User) authentication.getPrincipal();
        User existingUser = userRepository.findById(authenticatedUser.getId()).orElse(null);

        if (existingUser == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Usuario no encontrado");
        }

        List<String> errors = new ArrayList<>();
        Image newImage = null;
        boolean emailChanged = false;

        // Validar nombre
        if (updateUserDTO.name() == null || updateUserDTO.name().isEmpty()) {
            errors.add("El nombre es obligatorio.");
        }
        if(updateUserDTO.surname() == null || updateUserDTO.surname().isEmpty()){
            errors.add("El apellido es obligatorio.");
        }
        if(updateUserDTO.nickname() == null || updateUserDTO.nickname().isEmpty()){
            errors.add("El nombre de usuario es obligatorio.");
        }

        // Validar email
        if (updateUserDTO.email() != null && !updateUserDTO.email().isEmpty()) {
            if (!updateUserDTO.email().matches("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$")) {
                errors.add("El formato del email no es válido.");
            } else if (!updateUserDTO.email().equals(existingUser.getEmail())) {
                Optional<User> emailUser = userRepository.findByEmail(updateUserDTO.email());
                if (emailUser.isPresent() && !emailUser.get().getId().equals(existingUser.getId())) {
                    errors.add("El email ya está en uso.");
                } else {
                    emailChanged = true; // Solo se cambia si es diferente y no está en uso
                }
            }
        }

        // Validar nickname
        if (updateUserDTO.nickname() != null && !updateUserDTO.nickname().isEmpty()) {
            Optional<User> nicknameUser = userRepository.findByNickname(updateUserDTO.nickname());
            if (nicknameUser.isPresent() && !nicknameUser.get().getId().equals(existingUser.getId())) {
                errors.add("El nombre de usuario ya está en uso.");
            }
        }

        // Validar imagen
        if (updateUserDTO.imageId() != null) {
            newImage = imageRepository.findById(updateUserDTO.imageId()).orElse(null);
            if (newImage == null) {
                errors.add("Imagen no válida.");
            }
        }

        // Si hay errores de validación, los devolvemos antes de modificar el usuario
        if (!errors.isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("errors", errors));
        }

        // Aplicar actualizaciones solo si las validaciones pasaron
        if (updateUserDTO.name() != null && !updateUserDTO.name().isEmpty()) {
            existingUser.setName(updateUserDTO.name());
        }

        if (emailChanged) {
            existingUser.setEmail(updateUserDTO.email());
        }

        if (newImage != null) {
            existingUser.setImage(newImage);
        }

        userRepository.save(existingUser);

        return ResponseEntity.ok(Map.of(
            "name", existingUser.getName(),
            "email", existingUser.getEmail(),
            "imageId", existingUser.getImage() != null ? existingUser.getImage().getId() : null,
            "imageUrl", existingUser.getImage() != null ? existingUser.getImage().getImageUrl() : null,
            "newToken", emailChanged
        ));
    }


}