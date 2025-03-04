package com.todus.task;

import jakarta.persistence.*;
import lombok.*;
import com.todus.enums.Color;
import java.util.List;

@Entity
@Getter
@Setter
@Table(name = "priorities")
public class Priority {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String name;

    @Enumerated(EnumType.STRING)
    private Color color;

    @OneToMany(mappedBy = "priority")
    private List<Task> tasks;

}
