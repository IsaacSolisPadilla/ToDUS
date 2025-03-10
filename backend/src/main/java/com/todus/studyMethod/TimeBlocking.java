package com.todus.studyMethod;

import jakarta.persistence.*;
import lombok.*;
import java.util.List;
import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@DiscriminatorValue("TIME_BLOCKING")
public class TimeBlocking extends StudyMethod {

    @ElementCollection
    private List<LocalDateTime> timeBlocks;

    private int totalTime;
}
