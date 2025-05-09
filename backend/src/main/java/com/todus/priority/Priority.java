package com.todus.priority;

import jakarta.persistence.*;
import lombok.*;

import java.util.HashSet;
import java.util.Set;

import com.todus.enums.Color;
import com.todus.user.User;


@Entity
@Getter
@Setter
@Table(name = "priorities")
public class Priority {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
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

    @ManyToOne(optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
}
