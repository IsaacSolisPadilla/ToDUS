package com.todus.task;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.todus.category.Category;
import com.todus.task.Priority;
import com.todus.User.User;
import com.todus.category.CategoryRepository;
import com.todus.task.PriorityRepository;
import com.todus.User.UserRepository;
import com.todus.util.JwtUtil;
import com.todus.enums.Status;

import java.util.Optional;
import java.util.Map;

@Service
public class TaskService {

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private PriorityRepository priorityRepository;

    @Autowired
    private UserRepository userRepository;

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
     * Crea una nueva tarea para el usuario autenticado.
     */
    public Map<String, String> createTask(String token, TaskDTO taskRequest) {
        User user = getAuthenticatedUser(token);

        // Buscar la categoría si se especificó
        Category category = null;
        if (taskRequest.getCategoryId() != null) {
            category = categoryRepository.findById(taskRequest.getCategoryId()).orElse(null);
        }

        // Buscar la prioridad (obligatoria)
        Priority priority = priorityRepository.findById(taskRequest.getPriorityId())
                .orElseThrow(() -> new RuntimeException("Prioridad no encontrada"));

        // Crear la tarea
        Task task = new Task();
        task.setName(taskRequest.getName());
        task.setDescription(taskRequest.getDescription());
        task.setDueDate(taskRequest.getDueDate());
        task.setUser(user);
        task.setCategory(category);
        task.setPriority(priority);
        task.setStatus(Status.PENDENT);

        taskRepository.save(task);
        return Map.of("message", "Tarea creada con éxito");
    }
}
