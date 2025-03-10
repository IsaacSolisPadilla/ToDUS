package com.todus.subTask;

import jakarta.persistence.*;
import lombok.*;
import com.todus.enums.Status;
import javax.validation.constraints.NotNull;
import com.todus.task.Task;

@Entity
@Getter
@Setter
@Table(name = "subtasks")
public class SubTask {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    private String name;

    @Enumerated(EnumType.STRING)
    private Status status;

    @ManyToOne
    @JoinColumn(name = "task_id", referencedColumnName = "id")
    @NotNull
    private Task task;
}
