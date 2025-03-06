package com.todus.task;

import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Autowired;
import java.util.List;

@RestController
@RequestMapping("/api/priorities")
public class PriorityController {

    @Autowired
    private PriorityRepository priorityRepository;

    @GetMapping("/all")
    public List<Priority> getAllPriorities() {
        return priorityRepository.findAll();
    }
}
