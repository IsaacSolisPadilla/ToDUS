package com.todus.stats.dto;

public class PriorityCountDTO {
    private String priority;
    private long count;

    public PriorityCountDTO(String priority, long count) {
        this.priority = priority;
        this.count = count;
    }
    public String getPriority() { return priority; }
    public long getCount() { return count; }
}
