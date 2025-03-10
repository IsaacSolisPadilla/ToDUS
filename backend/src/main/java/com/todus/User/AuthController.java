package com.todus.user;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private final AuthService authService;

    @Autowired
    private UserRepository userRepository;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody User user) {
        try {
            String token = authService.login(user.getEmail(), user.getPassword());
    
            if (token == null || token.isEmpty()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Usuario o contraseña incorrectos"));
            }

            if(user.getEmail().isEmpty()){
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Rellene los campos"));
            }
    
            return ResponseEntity.ok(Map.of("token", token));
    
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("error", "Usuario o contraseña incorrectos"));
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterDTO registerDTO) {
        List<String> errors = new ArrayList<>();

        // Validar campos obligatorios
        if (registerDTO.getName() == null || registerDTO.getName().isEmpty()) {
            errors.add("El nombre es obligatorio.");
        }
        if (registerDTO.getSurname() == null || registerDTO.getSurname().isEmpty()) {
            errors.add("El apellido es obligatorio.");
        }
        if (registerDTO.getNickname() == null || registerDTO.getNickname().isEmpty()) {
            errors.add("El nombre de usuario es obligatorio.");
        }
        if (registerDTO.getEmail() == null || registerDTO.getEmail().isEmpty()) {
            errors.add("El email es obligatorio.");
        }
        if (registerDTO.getPassword() == null || registerDTO.getPassword().isEmpty()) {
            errors.add("La contraseña es obligatoria.");
        }

        // Validar formato del email
        if (registerDTO.getEmail() != null && !registerDTO.getEmail().matches("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$")) {
            errors.add("El formato del email no es válido.");
        }

        // Validar que el email no esté registrado
        if (registerDTO.getEmail() != null && userRepository.findByEmail(registerDTO.getEmail()).isPresent()) {
            errors.add("El email ya está en uso.");
        }

        // Validar que el nombre de usuario no esté en uso
        if (registerDTO.getNickname() != null && userRepository.findByNickname(registerDTO.getNickname()).isPresent()) {
            errors.add("El nombre de usuario ya está en uso.");
        }

        // Validar fortaleza de contraseña
        if (registerDTO.getPassword() != null) {
            if (registerDTO.getPassword().length() < 6) {
                errors.add("La contraseña debe tener al menos 6 caracteres.");
            }
            if (!registerDTO.getPassword().matches(".*[A-Z].*")) {
                errors.add("La contraseña debe incluir al menos una letra mayúscula.");
            }
            if (!registerDTO.getPassword().matches(".*\\d.*")) {
                errors.add("La contraseña debe incluir al menos un número.");
            }
        }

        // Si hay errores, los devolvemos antes de registrar el usuario
        if (!errors.isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("errors", errors));
        }

        // Si pasa todas las validaciones, registrar al usuario
        User newUser = authService.registerUser(registerDTO);
        return ResponseEntity.ok(newUser);
    }


    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(@RequestHeader("Authorization") String token, @RequestBody ChangePasswordDTO request) {
        try {
            return ResponseEntity.ok(authService.changePassword(token, request));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", "Error interno en el servidor"));
        }
    }
}
