package com.todus.priority;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.todus.user.AuthService;
import com.todus.user.User;

import java.util.List;

@RestController
@RequestMapping("/api/priorities")
public class PriorityController {

    @Autowired
    private PriorityService priorityService;

    @Autowired
    private PriorityRepository priorityRepository;

    @Autowired
    private AuthService userService;

    @GetMapping("/all")
    public List<Priority> getAllPriorities() {
        return priorityService.getAllPriorities();
    }

    @PostMapping("/create")
    public ResponseEntity<Priority> createPriority(
            @RequestBody Priority newPriority,
            @RequestHeader("Authorization") String token
    ) {
        // 1. Obtiene el usuario autenticado
        User user = userService.getAuthenticatedUser(token);
        // 2. Asigna el usuario a la nueva prioridad
        newPriority.setUser(user);

        // 3. Calcula el nivel sólo de sus propias prioridades
        long count = priorityRepository.countByUser(user);
        newPriority.setLevel((int) count + 1);

        Priority saved = priorityService.save(newPriority);
        return ResponseEntity.ok(saved);
    }

    @PutMapping("update/{id}")
    public Priority updatePriority(@PathVariable Long id, @RequestBody Priority updatedPriority) {
        Priority priority = priorityService.findById(id)
                .orElseThrow(() -> new RuntimeException("Priority not found"));
        priority.setName(updatedPriority.getName());
        priority.setColor(updatedPriority.getColor());
        return priorityService.save(priority);
    }

    @DeleteMapping("delete/{id}")
    public ResponseEntity<?> deletePriority(@PathVariable Long id) {
        if (priorityService.hasTasksWithPriority(id)) {
            return ResponseEntity.badRequest().body("No se puede eliminar. Esta prioridad tiene tareas asociadas.");
        }
        priorityRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/by-user")
    public ResponseEntity<List<Priority>> listByUser(@RequestHeader("Authorization") String token) {
        User user = userService.getAuthenticatedUser(token);
        List<Priority> priorities = priorityService.getPrioritiesByUser(user);
        return ResponseEntity.ok(priorities);
    }
}
