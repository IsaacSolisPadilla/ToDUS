package com.todus.task;

import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;

@Getter
@Setter
public class TaskDTO {
    private String name;
    private String description;
    private LocalDateTime dueDate;
    private Long categoryId; // Opcional
    private Long priorityId;
    private Long userId;
}
