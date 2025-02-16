package com.todus.User;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/user")
public class UserController {


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

    public record UserProfileDTO(String name, String email, Long imageId, String imageUrl) {}
}
