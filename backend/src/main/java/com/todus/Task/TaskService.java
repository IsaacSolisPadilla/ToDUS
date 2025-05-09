package com.todus.task;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.todus.category.Category;
import com.todus.category.CategoryRepository;
import com.todus.user.User;
import com.todus.user.UserRepository;
import com.todus.util.JwtUtil;
import com.todus.enums.Status;
import com.todus.priority.Priority;
import com.todus.priority.PriorityRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

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

    public Task getTaskById(Long taskId) {
        return taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Tarea no encontrada"));
    }
    
    public Map<String, String> createTask(String token, TaskDTO taskRequest) {
        User user = getAuthenticatedUser(token);

        Category category = null;
        if (taskRequest.getCategoryId() != null) {
            category = categoryRepository.findById(taskRequest.getCategoryId()).orElse(null);
        }

        Priority priority = priorityRepository.findById(taskRequest.getPriorityId())
                .orElseThrow(() -> new RuntimeException("Prioridad no encontrada"));

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
        task.setTrashed(false);


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
            task.setCompletedAt(null);
            taskRepository.save(task);
            return Map.of("message", "Tarea vuelta a pendiente");
        } else {
            task.setStatus(Status.COMPLETED);
            task.setCompletedAt(LocalDateTime.now());
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
        
        if (task.getDueDate() != null && !Objects.equals(taskRequest.getDueDate(), task.getDueDate())) {
            task.setRescheduled(true);
        }

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

    public Map<String, String> deleteAllTrashedTasks(String token, Long categoryId) {
        User user = getAuthenticatedUser(token); // Obtener el usuario autenticado

        List<Task> trashedTasks;
        if (categoryId != null) {
            trashedTasks = taskRepository.findByUserAndTrashedAndCategoryId(user, true, categoryId);
        } else {
            trashedTasks = taskRepository.findByUserAndTrashed(user, true);
        }

        if (trashedTasks.isEmpty()) {
            return Map.of("message", "No hay tareas en la papelera para eliminar");
        }

        taskRepository.deleteAll(trashedTasks);

        return Map.of("message", "Todas las tareas en la papelera han sido eliminadas correctamente");
    }

    public Map<String, String> trashTask(String token, Long taskId) {
        User user = getAuthenticatedUser(token);
    
        Task task = taskRepository.findById(taskId)
            .orElseThrow(() -> new RuntimeException("Tarea no encontrada"));
    
        if (!task.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("No tienes permisos para eliminar esta tarea");
        }
    
        task.setTrashed(true);
        task.setDateTrashed(LocalDateTime.now());
        taskRepository.save(task);
    
        return Map.of("message", "Tarea movida a la papelera correctamente");
    }

    public List<Task> getTrashedTasks(User user, Long categoryId) {
        List<Task> trashed = taskRepository.findByUserAndTrashed(user, true);
        if (categoryId != null) {
            trashed = trashed.stream()
              .filter(task -> task.getCategory() != null && task.getCategory().getId().equals(categoryId))
              .collect(Collectors.toList());
        }
        return trashed;
    }

    public Map<String, String> recoverTask(String token, Long taskId) {
        User user = getAuthenticatedUser(token);
        Task task = taskRepository.findById(taskId)
            .orElseThrow(() -> new RuntimeException("Tarea no encontrada"));
        if (!task.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("No tienes permisos para recuperar esta tarea");
        }
        task.setTrashed(false);
        task.setDateTrashed(null);
        taskRepository.save(task);
        return Map.of("message", "Tarea recuperada con éxito");
    }
    
        

}
