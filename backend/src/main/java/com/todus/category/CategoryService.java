package com.todus.category;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.todus.image.ImageRepository;
import com.todus.studyMethod.StudyMethodRepository;
import com.todus.user.User;
import com.todus.user.UserRepository;
import com.todus.util.JwtUtil;
import java.util.Map;
import com.todus.image.Image;
import com.todus.studyMethod.StudyMethod;

@Service
public class CategoryService {

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ImageRepository imageRepository;

    @Autowired
    private StudyMethodRepository studyMethodRepository;

    @Autowired
    private JwtUtil jwtUtil;

    /**
     * Obtiene el usuario autenticado a partir del token JWT.
     */
    public User getAuthenticatedUser(String token) {
        String email = jwtUtil.extractEmail(token.replace("Bearer ", ""));
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
    }

    /**
     * Crea una nueva categoría para el usuario autenticado.
     */
    public Map<String, String> createCategory(String token, CategoryDTO categoryRequest) {
        User user = getAuthenticatedUser(token);

        if (categoryRequest.getImageId() == null) {
            throw new RuntimeException("La imagen es obligatoria para crear una categoría.");
        }

        Image image = imageRepository.findById(categoryRequest.getImageId())
                .orElseThrow(() -> new RuntimeException("Imagen no encontrada con ID: " + categoryRequest.getImageId()));

        StudyMethod studyMethod = null;
        if (categoryRequest.getStudyMethodId() != null) {
            studyMethod = studyMethodRepository.findById(categoryRequest.getStudyMethodId()).orElse(null);
        }

        Category category = new Category();
        category.setName(categoryRequest.getName());
        category.setDescription(categoryRequest.getDescription());
        category.setOrderTasks(categoryRequest.getOrderTasks());
        category.setImage(image);
        category.setUser(user);
        category.setStudyMethod(studyMethod);

        categoryRepository.save(category);
        return Map.of("message", "Categoría creada con éxito");
    }
}
