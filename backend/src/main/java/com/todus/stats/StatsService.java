package com.todus.stats;

import com.todus.stats.dto.*;
import com.todus.subTask.SubTaskRepository;
import com.todus.task.Task;
import com.todus.task.TaskRepository;
import com.todus.user.User;
import com.todus.user.UserRepository;
import com.todus.enums.Status;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class StatsService {
    @Autowired
    private TaskRepository taskRepo;

    @Autowired
    private SubTaskRepository subTaskRepo;

    @Autowired
    private UserRepository userService;

    public StatsDTO getStatsForUser(String nickname) {
        User user = userService.findByNickname(nickname).orElse(null);
        Long userId = user.getId();

        long total = taskRepo.countByUserIdAndTrashedFalse(userId);
        long completed = taskRepo.countByUserIdAndStatusAndTrashedFalse(userId, Status.COMPLETED);
        long pending = taskRepo.countByUserIdAndStatusNotAndTrashedFalse(userId, Status.COMPLETED);
        long rescheduledCount = taskRepo.countByUserIdAndRescheduledTrue(userId);
        long overdueCount = taskRepo.countByUserIdAndDueDateBeforeAndStatusNotAndTrashedFalse(userId, LocalDateTime.now(), Status.COMPLETED);

        double rate = total > 0 ? Math.round((completed * 100.0 / total) * 10) / 10.0 : 0;

        LocalDateTime thirtyAgo = LocalDateTime.now().minusDays(30);
        List<Task> recent = taskRepo.findByUserIdAndStatusAndCompletedAtAfter(userId, Status.COMPLETED, thirtyAgo);
        Map<LocalDate, Long> map = recent.stream()
            .collect(Collectors.groupingBy(t -> t.getCompletedAt().toLocalDate(), Collectors.counting()));
        List<DailyCountDTO> byDay = new ArrayList<>();
        for (int i = 30; i >= 0; i--) {
            LocalDate date = LocalDate.now().minusDays(i);
            byDay.add(new DailyCountDTO(date, map.getOrDefault(date, 0L)));
        }

        double avgHours = recent.stream()
            .mapToDouble(t -> ChronoUnit.SECONDS.between(t.getDateCreated(), t.getCompletedAt()) / 3600.0)
            .average().orElse(0);

        List<CategoryCountDTO> byCat = taskRepo.countGroupByCategory(userId).stream()
            .map(o -> new CategoryCountDTO((String)o[0], (Long)o[1])).collect(Collectors.toList());

        List<PriorityCountDTO> byPri = taskRepo.countGroupByPriority(userId).stream()
            .map(o -> new PriorityCountDTO((String)o[0], (Long)o[1])).collect(Collectors.toList());

        long deleted = taskRepo.countByUserIdAndTrashedTrue(userId);
        int streak = 0;
        for (int i = byDay.size()-1; i>=0; i--) {
            if (byDay.get(i).getCount() > 0) streak++; else break;
        }

        LocalDate startThis = LocalDate.now().withDayOfMonth(1);
        LocalDate startLast = startThis.minusMonths(1);
        LocalDate endLast = startThis.minusDays(1);
        long thisCount = taskRepo.countByUserIdAndDateCreatedBetween(userId, startThis.atStartOfDay(), LocalDateTime.now());
        long lastCount = taskRepo.countByUserIdAndDateCreatedBetween(userId, startLast.atStartOfDay(), endLast.atTime(23,59,59));

        long totalSub = subTaskRepo.countByTaskUserId(userId);
        long subtaskCompletedCount = subTaskRepo.countByTaskUserIdAndStatus(userId, Status.COMPLETED);
        double subtaskCompletionRate = totalSub>0 ? subtaskCompletedCount*100.0/totalSub : 0;
        
        List<Object[]> raw = taskRepo.countByCompletedHour(userId);
        Map<Integer, Long> hourCounts = raw.stream()
        .collect(Collectors.toMap(
            row -> (Integer) row[0],
            row -> (Long)    row[1]
        ));

        // Agrupa en franjas de 2h
        List<TimeSlotDTO> slots = new ArrayList<>();
        for (int start = 0; start < 24; start += 2) {
        int end = start + 2;
        long sum = hourCounts.getOrDefault(start, 0L) + hourCounts.getOrDefault(start + 1, 0L);
        String label = String.format("%02d-%02d", start, end);
        slots.add(new TimeSlotDTO(label, sum));
        }


        MonthComparisonDTO comp = new MonthComparisonDTO(thisCount, lastCount);
        return new StatsDTO(total, completed, pending, rate, byDay, avgHours, byCat, byPri, streak, comp, deleted, rescheduledCount, overdueCount, subtaskCompletionRate, totalSub, subtaskCompletedCount, slots);
    }
}

