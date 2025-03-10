package com.todus.user;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.todus.image.Image;
import com.todus.image.ImageRepository;
import com.todus.util.JwtUtil;

@Service
public class AuthService {
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ImageRepository imageRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    public String login(String email, String password) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new RuntimeException("Credenciales incorrectas");
        }

        return jwtUtil.generateToken(user.getEmail());
    }

    public User registerUser(RegisterDTO registerDTO) {
        User user = new User();
        user.setName(registerDTO.getName());
        user.setSurname(registerDTO.getSurname());
        user.setNickname(registerDTO.getNickname());
        user.setEmail(registerDTO.getEmail());
        user.setPassword(passwordEncoder.encode(registerDTO.getPassword()));

        // Buscar la imagen en la base de datos si se proporciona un imageId
        if (registerDTO.getImageId() != null) {
            Image image = imageRepository.findById(registerDTO.getImageId())
                    .orElseThrow(() -> new RuntimeException("Imagen no encontrada"));
            user.setImage(image);
        }

        return userRepository.save(user);
    }

    public User getAuthenticatedUser(String token) {
        String email = jwtUtil.extractEmail(token.replace("Bearer ", ""));
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
    }

    /**
     * Cambia la contraseña de un usuario autenticado.
     */
    public Map<String, String> changePassword(String token, ChangePasswordDTO request) {
        User user = getAuthenticatedUser(token);

        // Verificar si la contraseña actual es correcta
        if (!passwordEncoder.matches(request.getOldPassword(), user.getPassword())) {
            throw new RuntimeException("La contraseña actual es incorrecta");
        }

        // Verificar que la nueva contraseña y la confirmación coincidan
        if (!request.getNewPassword().equals(request.getConfirmNewPassword())) {
            throw new RuntimeException("La nueva contraseña y la confirmación no coinciden");
        }

        // Cifrar la nueva contraseña y guardarla
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        return Map.of("message", "Contraseña cambiada correctamente");
    }
}
