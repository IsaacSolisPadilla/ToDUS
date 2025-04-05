package com.todus.task;

import jakarta.persistence.*;
import lombok.*;
import com.todus.user.User;
import com.todus.enums.Status;
import com.todus.priority.Priority;

import java.time.LocalDateTime;
import java.util.List;
import javax.validation.constraints.NotNull;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.todus.category.Category;
import com.todus.subTask.SubTask;



@Entity
@Getter
@Setter
@Table(name = "tasks")
public class Task {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(updatable = false)
    @NotNull
    private LocalDateTime dateCreated = LocalDateTime.now();

    private LocalDateTime dueDate;

    @Enumerated(EnumType.STRING)
    private Status status;

    @Column(nullable = false)
    private Boolean trashed = false;

    @ManyToOne
    @JoinColumn(name = "user_id", referencedColumnName = "id", nullable = false)
    private User user;

    @ManyToOne
    @JoinColumn(name = "category_id", referencedColumnName = "id", nullable = true)
    @org.hibernate.annotations.OnDelete(action = org.hibernate.annotations.OnDeleteAction.SET_NULL)
    @JsonManagedReference
    private Category category;

    @OneToMany(mappedBy = "task", cascade = CascadeType.ALL)
    @JsonManagedReference
    private List<SubTask> subtasks;

    @ManyToOne
    @JoinColumn(name = "priority_id", referencedColumnName = "id", nullable = false)
    private Priority priority;
}
