package com.todus.category;

import com.todus.enums.OrderTask;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CategoryDTO {
    private String name;
    private String description;
    private OrderTask orderTasks;
    private Long imageId;
    private Long studyMethodId; // Opcional
}
