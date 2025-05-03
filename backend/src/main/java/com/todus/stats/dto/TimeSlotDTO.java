package com.todus.stats.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class TimeSlotDTO {
    private String slot;
    private long count;

    public TimeSlotDTO(String label, long sum) {
        this.slot = label;
        this.count = sum;
    }
}
