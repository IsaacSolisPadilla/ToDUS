package com.todus.task;

import jakarta.persistence.*;
import lombok.*;
import com.todus.enums.Color;


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
    @Column(length = 20)
    private Color color;

    @Column(nullable = false)
    private Integer level;
    
    @Transient
    public String getColorHex() {
        return color.getHex();
    }
}
