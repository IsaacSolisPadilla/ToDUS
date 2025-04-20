package com.todus.priority;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/priorities")
public class PriorityController {

    @Autowired
    private PriorityService priorityService;

    @Autowired
    private PriorityRepository priorityRepository;

    @GetMapping("/all")
    public List<Priority> getAllPriorities() {
        return priorityService.getAllPriorities();
    }

    @PostMapping("/create")
    public Priority createPriority(@RequestBody Priority newPriority) {
        int totalPriorities = priorityRepository.findAll().size();
        newPriority.setLevel(totalPriorities + 1);
        return priorityService.save(newPriority);
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
}
