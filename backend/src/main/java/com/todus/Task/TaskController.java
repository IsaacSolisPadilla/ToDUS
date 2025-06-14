package com.todus.task;

import org.springframework.http.HttpStatus;
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

    

    @PutMapping("/trash/{id}")
    public ResponseEntity<?> trashTask(@RequestHeader("Authorization") String token, @PathVariable Long id) {
        try {
            return ResponseEntity.ok(taskService.trashTask(token, id));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", "Error interno en el servidor"));
        }
    }

    @PutMapping("/restore/{id}")
    public ResponseEntity<?> recoverTask(@RequestHeader("Authorization") String token, @PathVariable Long id) {
        try {
            return ResponseEntity.ok(taskService.recoverTask(token, id));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/trash")
    public ResponseEntity<List<Task>> getTrashedTasks(@RequestHeader("Authorization") String token,
                                                      @RequestParam(required = false) Long categoryId) {
        User user = taskService.getAuthenticatedUser(token);
        List<Task> trashedTasks = taskService.getTrashedTasks(user, categoryId);
        return ResponseEntity.ok(trashedTasks);
    }

    @PostMapping("/trash/deleteAll")
    public ResponseEntity<Map<String, String>> deleteAllTrashedTasks(
        @RequestHeader("Authorization") String token, 
        @RequestParam(value = "categoryId", required = false) Long categoryId) {

        try {
            Map<String, String> response = taskService.deleteAllTrashedTasks(token, categoryId);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }


    
}
