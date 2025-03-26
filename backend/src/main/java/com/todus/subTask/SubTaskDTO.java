package com.todus.subTask;


import javax.validation.constraints.NotNull;

import com.todus.enums.Status;

import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SubTaskDTO {
    
    @NotNull
    private String name;

    @Enumerated(EnumType.STRING)
    private Status status;
}
