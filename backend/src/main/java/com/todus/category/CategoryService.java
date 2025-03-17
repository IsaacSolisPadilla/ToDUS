package com.todus.category;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.todus.image.Image;
import com.todus.image.ImageRepository;
import com.todus.studyMethod.StudyMethod;
import com.todus.studyMethod.StudyMethodRepository;
import com.todus.user.User;
import com.todus.user.UserRepository;
import com.todus.util.JwtUtil;

import java.util.List;
import java.util.Map;

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

    /**
     * Obtiene todas las categorías del usuario autenticado.
     */
    public List<Category> getAllUserCategories(String token) {
        User user = getAuthenticatedUser(token);
        return categoryRepository.findAllByUser(user);
    }

    /**
     * Actualiza una categoría del usuario autenticado.
     */
    public Map<String, String> updateCategory(String token, Long categoryId, CategoryDTO categoryRequest) {
        User user = getAuthenticatedUser(token);

        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new RuntimeException("Categoría no encontrada"));

        if (!category.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("No tienes permisos para modificar esta categoría");
        }

        category.setName(categoryRequest.getName());
        category.setDescription(categoryRequest.getDescription());
        category.setOrderTasks(categoryRequest.getOrderTasks());

        if (categoryRequest.getImageId() != null) {
            Image image = imageRepository.findById(categoryRequest.getImageId())
                    .orElseThrow(() -> new RuntimeException("Imagen no encontrada"));
            category.setImage(image);
        }

        if (categoryRequest.getStudyMethodId() != null) {
            StudyMethod studyMethod = studyMethodRepository.findById(categoryRequest.getStudyMethodId()).orElse(null);
            category.setStudyMethod(studyMethod);
        }

        categoryRepository.save(category);
        return Map.of("message", "Categoría actualizada con éxito");
    }

    /**
     * Elimina una categoría del usuario autenticado.
     */
    public Map<String, String> deleteCategory(String token, Long categoryId) {
        User user = getAuthenticatedUser(token);

        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new RuntimeException("Categoría no encontrada"));

        if (!category.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("No tienes permisos para eliminar esta categoría");
        }

        categoryRepository.delete(category);
        return Map.of("message", "Categoría eliminada correctamente");
    }
}
