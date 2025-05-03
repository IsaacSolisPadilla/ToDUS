package com.todus.stats.dto;

import java.util.List;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class StatsDTO {
    private long totalTasks;
    private long completedTasks;
    private long pendingTasks;
    private double completionRate;
    private List<DailyCountDTO> tasksByDay;
    private double avgCompletionTime;
    private List<CategoryCountDTO> tasksByCategory;
    private List<PriorityCountDTO> tasksByPriority;
    private int currentStreak;
    private MonthComparisonDTO monthComparison;
    private long deletedCount;
    private long rescheduledCount;
    private long overdueCount;
    private double subtaskCompletionRate;
    private long totalSub;
    private long subtaskCompletedCount;
    private List<TimeSlotDTO> tasksByTimeSlot;

    public StatsDTO(long totalTasks, long completedTasks, long pendingTasks,
                    double completionRate, List<DailyCountDTO> tasksByDay,
                    double avgCompletionTime, List<CategoryCountDTO> tasksByCategory,
                    List<PriorityCountDTO> tasksByPriority, int currentStreak,
                    MonthComparisonDTO monthComparison, long deletedCount, long rescheduledCount,
                    long overdueCount, double subtaskCompletionRate, long totalSub,
                    long subtaskCompletedCount, List<TimeSlotDTO> tasksByTimeSlot) {
        this.tasksByTimeSlot = tasksByTimeSlot;
        this.subtaskCompletedCount = subtaskCompletedCount;
        this.totalSub = totalSub;
        this.subtaskCompletionRate = subtaskCompletionRate;
        this.overdueCount = overdueCount;
        this.rescheduledCount = rescheduledCount;
        this.totalTasks = totalTasks;
        this.completedTasks = completedTasks;
        this.pendingTasks = pendingTasks;
        this.completionRate = completionRate;
        this.tasksByDay = tasksByDay;
        this.avgCompletionTime = avgCompletionTime;
        this.tasksByCategory = tasksByCategory;
        this.tasksByPriority = tasksByPriority;
        this.currentStreak = currentStreak;
        this.monthComparison = monthComparison;
        this.deletedCount = deletedCount;
    }
    // Getters omitted for brevity
}
