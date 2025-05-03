package com.todus.stats.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class MonthComparisonDTO {
    private long thisMonth;
    private long lastMonth;

    public MonthComparisonDTO(long thisMonth, long lastMonth) {
        this.thisMonth = thisMonth;
        this.lastMonth = lastMonth;
    }
    public long getThisMonth() { return thisMonth; }
    public long getLastMonth() { return lastMonth; }
}