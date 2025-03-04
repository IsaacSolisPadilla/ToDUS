package com.todus.study;

import jakarta.persistence.*;
import lombok.*;
import java.util.List;
import com.todus.category.Category;

@Entity
@Getter
@Setter
@Inheritance(strategy = InheritanceType.SINGLE_TABLE)
@DiscriminatorColumn(name = "method_type", discriminatorType = DiscriminatorType.STRING)
@Table(name = "study_methods")
public abstract class StudyMethod {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    @OneToMany(mappedBy = "studyMethod", cascade = CascadeType.ALL)
    private List<Category> categories;
}
