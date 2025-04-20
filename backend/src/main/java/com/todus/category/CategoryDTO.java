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
    private Boolean showComplete = false;
    private Long studyMethodId;
    private Boolean autoDeleteComplete = false;
    private Integer deleteCompleteDays;
}
