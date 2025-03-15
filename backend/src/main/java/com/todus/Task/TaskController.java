package com.todus.task;

import org.springframework.http.ResponseEntity;

import com.todus.user.AuthService;
import com.todus.user.User;
import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tasks")
public class TaskController {

    @Autowired
    private TaskService taskService;
    @Autowired
    private AuthService userService;

    @PostMapping("/create")
    public ResponseEntity<?> createTask(@RequestHeader("Authorization") String token, @RequestBody TaskDTO taskRequest) {
        try {
            Map<String, String> response = taskService.createTask(token, taskRequest);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/list")
    public ResponseEntity<List<Task>> getTaskByUser(@RequestHeader("Authorization") String token) {
        User user = userService.getAuthenticatedUser(token);
        List<Task> tasks = taskService.getTasksByUser(user);
        return ResponseEntity.ok(tasks);
    }

    @PutMapping("/complete/{id}")
    public ResponseEntity<?> markTaskAsCompleted(@RequestHeader("Authorization") String token, @PathVariable Long id) {
        try {
            return ResponseEntity.ok(taskService.markTaskAsCompleted(token, id));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", "Error interno en el servidor"));
        }
    }

    @PutMapping("/update/{taskId}")
    public ResponseEntity<?> updateTask(
            @RequestHeader("Authorization") String token,
            @PathVariable Long taskId,
            @RequestBody TaskDTO taskDTO) {
        return ResponseEntity.ok(taskService.updateTask(token, taskId, taskDTO));
    }


    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteTask(@RequestHeader("Authorization") String token, @PathVariable Long id) {
        try {
            return ResponseEntity.ok(taskService.deleteTask(token, id));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", "Error interno en el servidor"));
        }
    }


    
}
