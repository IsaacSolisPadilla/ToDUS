package com.todus.priority;

import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Autowired;
import java.util.List;

@RestController
@RequestMapping("/api/priorities")
public class PriorityController {

    @Autowired
    private PriorityService priorityService;

    @GetMapping("/all")
    public List<Priority> getAllPriorities() {
        return priorityService.getAllPriorities();
    }

    @PatchMapping("/{id}/color")
    public Priority updateColor(@PathVariable Long id, @RequestBody ColorUpdate request) {
        Priority priority = priorityService.findById(id)
                .orElseThrow(() -> new RuntimeException("Priority not found"));

        priority.setColor(request.getColor());
        return priorityService.save(priority);
    }

    @PostMapping
    public Priority createPriority(@RequestBody Priority newPriority) {
        return priorityService.save(newPriority);
    }

    @GetMapping("/{id}/hasTasks")
    public boolean hasTasks(@PathVariable Long id) {
        return priorityService.hasTasksWithPriority(id);
    }
}

