package com.todus.User;

import org.springframework.web.bind.annotation.*;

import com.todus.Image.Image;
import com.todus.Image.ImageRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ImageRepository imageRepository;

    @PostMapping("/set-image/{imageId}")
    public ResponseEntity<String> setUserImage(
        @AuthenticationPrincipal UserDetails userDetails, 
        @PathVariable Long imageId
    ) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        Image image = imageRepository.findById(imageId)
                .orElseThrow(() -> new RuntimeException("Imagen no encontrada"));

        user.setImage(image);
        userRepository.save(user);

        return ResponseEntity.ok("Imagen asignada correctamente al usuario.");
    }
}

