package com.todus.user;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.todus.enums.Color;
import com.todus.image.Image;
import com.todus.image.ImageRepository;
import com.todus.priority.Priority;
import com.todus.priority.PriorityRepository;
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
    private PriorityRepository priorityRepository;

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

        userRepository.save(user);

        List<Priority> defaults = List.of(
            createPriority("Baja", 4, Color.PINK, user),
            createPriority("Media", 3, Color.YELLOW, user),
            createPriority("Alta", 2, Color.ORANGE, user),
            createPriority("Crítica", 1, Color.RED, user)
        );
        // Salvar todas de golpe
        priorityRepository.saveAll(defaults);

        return user;
    }

    private Priority createPriority(String name, Integer level, Color color, User u) {
        Priority p = new Priority();
        p.setName(name);
        p.setLevel(level);
        p.setColor(color);
        p.setUser(u);
        return p;
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
