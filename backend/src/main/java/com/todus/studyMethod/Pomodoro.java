package com.todus.studyMethod;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@DiscriminatorValue("POMODORO")
public class Pomodoro extends StudyMethod {

    private LocalDateTime workTime;
    private LocalDateTime breakTime;
    private int times;
}
