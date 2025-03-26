package com.todus.subTask;

import com.todus.task.Task;
import com.todus.task.TaskService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/subtasks")
public class SubTaskController {

    @Autowired
    private SubTaskService subTaskService;
    
    @Autowired
    private TaskService taskService;

    @PostMapping("/create/{taskId}")
    public ResponseEntity<?> createSubTask(@PathVariable Long taskId, @RequestBody SubTaskDTO subTaskRequest) {
        try {
            Task task = taskService.getTaskById(taskId);
            SubTask subTask = subTaskService.createSubTask(subTaskRequest, task);
            return ResponseEntity.ok(subTask);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error al crear la subtarea: " + e.getMessage());
        }
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<?> deleteSubTask(@PathVariable Long id) {
        try {
            subTaskService.deleteSubTask(id);
            return ResponseEntity.ok("Subtarea eliminada exitosamente");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error al eliminar la subtarea: " + e.getMessage());
        }
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<?> updateSubTask(@PathVariable Long id, @RequestBody SubTaskDTO subTaskRequest) {
        try {
            SubTask updatedSubTask = subTaskService.updateSubTask(id, subTaskRequest);
            return ResponseEntity.ok(updatedSubTask);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error al actualizar la subtarea: " + e.getMessage());
        }
    }

    @PutMapping("/complete/{id}")
    public ResponseEntity<?> completeSubTask(@PathVariable Long id) {
        try {
            SubTask updatedSubTask = subTaskService.completeSubTask(id);
            return ResponseEntity.ok(updatedSubTask);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error al marcar la subtarea como completada: " + e.getMessage());
        }
    }

    @GetMapping("/task/{taskId}")
    public ResponseEntity<List<SubTask>> getSubTasksByTask(@PathVariable Long taskId) {
        List<SubTask> subTasks = subTaskService.getSubTasksByTask(taskId);
        return ResponseEntity.ok(subTasks);
    }
}
