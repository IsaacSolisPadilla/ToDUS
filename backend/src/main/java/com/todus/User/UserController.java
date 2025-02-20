package com.todus.User;


import java.util.Map;
import java.util.Optional;

import javax.validation.Valid;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import com.todus.Image.Image;
import com.todus.Image.ImageRepository;

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
            user.getEmail(),
            user.getImage() != null ? user.getImage().getId() : null,
            user.getImage() != null ? user.getImage().getImageUrl() : null
        ));
    }

    @PutMapping("/update")
@Transactional
public ResponseEntity<?> updateUser(@Valid @RequestBody UserProfileDTO updateUserDTO) {
    Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

    if (authentication == null || !authentication.isAuthenticated()) {
        return ResponseEntity.status(401).body("Usuario no autenticado");
    }

    User user = (User) authentication.getPrincipal();
    Optional<User> optionalUser = userRepository.findById(user.getId());

    if (optionalUser.isEmpty()) {
        return ResponseEntity.status(404).body("Usuario no encontrado");
    }

    User existingUser = optionalUser.get();
    boolean emailChanged = false;

    // Validar y actualizar nombre
    if (updateUserDTO.name() != null && !updateUserDTO.name().isEmpty()) {
        existingUser.setName(updateUserDTO.name());
    }

    // Validar y actualizar email solo si cambió y tiene formato válido
    if (!existingUser.getEmail().equals(updateUserDTO.email())) {
        Optional<User> emailUser = userRepository.findByEmail(updateUserDTO.email());
        if (emailUser.isPresent() && !emailUser.get().getId().equals(existingUser.getId())) {
            return ResponseEntity.status(400).body("El email ya está en uso por otro usuario");
        }
        emailChanged = true;
        existingUser.setEmail(updateUserDTO.email());
    }

    // Validar y actualizar imagen si existe
    if (updateUserDTO.imageId() != null) {
        Optional<Image> optionalImage = imageRepository.findById(updateUserDTO.imageId());
        if (optionalImage.isPresent()) {
            existingUser.setImage(optionalImage.get());
        } else {
            return ResponseEntity.status(400).body("Imagen no válida");
        }
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
