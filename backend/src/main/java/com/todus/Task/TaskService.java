package com.todus.task;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.todus.category.Category;
import com.todus.category.CategoryRepository;
import com.todus.user.User;
import com.todus.user.UserRepository;
import com.todus.util.JwtUtil;
import com.todus.enums.Status;

import java.util.List;
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

        Category category = null;
        if (taskRequest.getCategoryId() != null) {
            category = categoryRepository.findById(taskRequest.getCategoryId()).orElse(null);
        }

        Priority priority = priorityRepository.findById(taskRequest.getPriorityId())
                .orElseThrow(() -> new RuntimeException("Prioridad no encontrada"));

        // Crear la tarea
        Task task = new Task();
        task.setName(taskRequest.getName());
        task.setDescription(taskRequest.getDescription());
        if (taskRequest.getDueDate() == null) {
            task.setDueDate(null);
        } else {
            task.setDueDate(taskRequest.getDueDate());
        }
        task.setUser(user);
        task.setCategory(category);
        task.setPriority(priority);
        task.setStatus(Status.PENDENT);


        taskRepository.save(task);
        return Map.of("message", "Tarea creada con éxito");
    }

    public List<Task> getTasksByUser(User user) {
        return taskRepository.findByUser(user);
    }

    public Map<String, String> markTaskAsCompleted(String token, Long taskId) {
        User user = getAuthenticatedUser(token);
    
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Tarea no encontrada"));
    
        if (!task.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("No tienes permisos para modificar esta tarea");
        }
    
        if (task.getStatus() == Status.COMPLETED) {
            task.setStatus(Status.PENDENT);
            taskRepository.save(task);
            return Map.of("message", "Tarea vuelta a pendiente");
        } else {
            task.setStatus(Status.COMPLETED);
            taskRepository.save(task);
            return Map.of("message", "Tarea marcada como completada");
        }
    }
    

    public Map<String, String> updateTask(String token, Long taskId, TaskDTO taskRequest) {
        User user = getAuthenticatedUser(token);
    
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Tarea no encontrada"));
    
        if (!task.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("No tienes permisos para modificar esta tarea");
        }
    
        task.setName(taskRequest.getName());
        task.setDescription(taskRequest.getDescription());
    
        if (taskRequest.getDueDate() == null) {
            task.setDueDate(null);
        } else {
            task.setDueDate(taskRequest.getDueDate());
        }
    
        if (taskRequest.getPriorityId() != null) {
            Priority priority = priorityRepository.findById(taskRequest.getPriorityId())
                    .orElseThrow(() -> new RuntimeException("Prioridad no encontrada"));
            task.setPriority(priority);
        }
    
        if (taskRequest.getCategoryId() != null) {
            Category category = categoryRepository.findById(taskRequest.getCategoryId())
                    .orElse(null); // categoría opcional
            task.setCategory(category);
        }
    
        taskRepository.save(task);
        return Map.of("message", "Tarea actualizada con éxito");
    }
    

    public Map<String, String> deleteTask(String token, Long taskId) {
        User user = getAuthenticatedUser(token); // método que extrae el usuario desde el token
    
        Task task = taskRepository.findById(taskId)
            .orElseThrow(() -> new RuntimeException("Tarea no encontrada"));
    
        // Verificar que la tarea pertenece al usuario autenticado
        if (!task.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("No tienes permisos para eliminar esta tarea");
        }
    
        taskRepository.delete(task);
    
        return Map.of("message", "Tarea eliminada correctamente");
    }
    
        

}
