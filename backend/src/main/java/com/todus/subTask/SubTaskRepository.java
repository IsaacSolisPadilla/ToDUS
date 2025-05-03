package com.todus.subTask;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.todus.enums.Status;

import java.util.List;

@Repository
public interface SubTaskRepository extends JpaRepository<SubTask, Long> {
    List<SubTask> findByTaskId(Long taskId);  // Método para obtener las subtareas de una tarea específica

    long countByTaskUserId(Long userId);
    long countByTaskUserIdAndStatus(Long userId, Status status);
}
