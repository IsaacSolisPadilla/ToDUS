package com.todus.category;

import jakarta.persistence.*;
import lombok.*;
import com.todus.user.User;
import com.todus.task.Task;
import javax.validation.constraints.NotNull;
import com.todus.image.Image;
import java.util.List;
import com.todus.enums.OrderTask;
import com.todus.studyMethod.StudyMethod;

@Entity
@Getter
@Setter
@Table(name = "categories")
public class Category {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    private String name;

    private String description;

    @Enumerated(EnumType.STRING)
    @Column(length = 100)
    private OrderTask orderTasks;

    @ManyToOne
    @JoinColumn(name = "image_id", referencedColumnName = "id", nullable = false)
    private Image image;

    @ManyToOne
    @JoinColumn(name = "user_id", referencedColumnName = "id", nullable = false)
    private User user;

    @OneToMany(mappedBy = "category", cascade = CascadeType.ALL)
    private List<Task> tasks;

    @OneToOne
    @JoinColumn(name = "study_method_id", referencedColumnName = "id")
    private StudyMethod studyMethod;
}