package com.todus.subTask;

import com.todus.task.Task;
import com.todus.enums.Status;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class SubTaskService {

    @Autowired
    private SubTaskRepository subTaskRepository;

    // Crear SubTask
    public SubTask createSubTask(SubTaskDTO subTaskRequest, Task task) {
        // Convertir el DTO a la entidad SubTask
        SubTask subTask = new SubTask();
        subTask.setName(subTaskRequest.getName());
        // Asignamos el estado por defecto; si prefieres usar el enviado en el DTO, cámbialo
        subTask.setStatus(Status.PENDENT);
        subTask.setTask(task);
        return subTaskRepository.save(subTask);
    }

    // Eliminar SubTask
    public void deleteSubTask(Long id) {
        subTaskRepository.deleteById(id);
    }

    // Actualizar SubTask
    public SubTask updateSubTask(Long id, SubTaskDTO subTaskRequest) {
        SubTask subTask = subTaskRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Subtarea no encontrada"));
        subTask.setName(subTaskRequest.getName());
        subTask.setStatus(subTaskRequest.getStatus());
        return subTaskRepository.save(subTask);
    }

    // Marcar como completada o pendiente
    public SubTask completeSubTask(Long id) {
        SubTask subTask = subTaskRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Subtarea no encontrada"));
        if (subTask.getStatus() == Status.COMPLETED) {
            subTask.setStatus(Status.PENDENT);
        } else {
            subTask.setStatus(Status.COMPLETED);
        }
        return subTaskRepository.save(subTask);
    }

    // Obtener todas las subtareas asociadas a una tarea
    public List<SubTask> getSubTasksByTask(Long taskId) {
        return subTaskRepository.findByTaskId(taskId);
    }
}
