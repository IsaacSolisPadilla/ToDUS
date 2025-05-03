package com.todus.stats.dto;

import java.time.LocalDate;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class DailyCountDTO {
    private LocalDate date;
    private long count;

    public DailyCountDTO(LocalDate date, long count) {
        this.date = date;
        this.count = count;
    }
    public LocalDate getDate() { return date; }
    public long getCount() { return count; }
}
