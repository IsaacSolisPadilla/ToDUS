package com.todus.priority;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.todus.task.Task;
import com.todus.task.TaskRepository;
import com.todus.user.User;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class PriorityService {

    @Autowired
    private PriorityRepository priorityRepository;

    @Autowired
    private TaskRepository taskRepository;

    public List<Priority> getAllPriorities() {
        return priorityRepository.findAll();
    }

    public Optional<Priority> findById(Long id) {
        return priorityRepository.findById(id);
    }

    public Priority save(Priority priority) {
        return priorityRepository.save(priority);
    }

    public boolean hasTasksWithPriority(Long priorityId) {
        List<Task> tasks = taskRepository.findByPriorityId(priorityId);
        return !tasks.isEmpty();
    }

    public List<Priority> getPrioritiesByUser(User user) {
        return priorityRepository.findByUserId(user.getId());
    }
}
