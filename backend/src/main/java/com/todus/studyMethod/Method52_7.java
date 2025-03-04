package com.todus.study;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Setter
@DiscriminatorValue("52_7_METHOD")
public class Method52_7 extends StudyMethod {

    private int workTime = 52;
    private int breakTime = 7;
}
