package com.todus.task;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.todus.category.Category;
import com.todus.task.Priority;
import com.todus.User.User;
import com.todus.category.CategoryRepository;
import com.todus.task.PriorityRepository;
import com.todus.User.UserRepository;

import java.util.Optional;

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

    public String createTask(TaskDTO taskRequest) throws Exception {
        User user = null; // Permitir que una tarea no tenga usuario asociado

        if (taskRequest.getUserId() != null) {
            Optional<User> userOpt = userRepository.findById(taskRequest.getUserId());
            if (userOpt.isPresent()) {
                user = userOpt.get();
            }
        }

        // Buscar la categoría si se especificó
        Category category = null;
        if (taskRequest.getCategoryId() != null) {
            category = categoryRepository.findById(taskRequest.getCategoryId()).orElse(null);
        }

        // Buscar la prioridad (obligatoria)
        Optional<Priority> priorityOpt = priorityRepository.findById(taskRequest.getPriorityId());
        if (priorityOpt.isEmpty()) {
            throw new Exception("Prioridad no encontrada");
        }
        Priority priority = priorityOpt.get();

        // Crear la tarea
        Task task = new Task();
        task.setName(taskRequest.getName());
        task.setDescription(taskRequest.getDescription());
        task.setDueDate(taskRequest.getDueDate());
        task.setUser(user); // Puede ser NULL si no hay usuario autenticado
        task.setCategory(category);
        task.setPriority(priority);

        taskRepository.save(task);
        return "Tarea creada con éxito";
    }
}
