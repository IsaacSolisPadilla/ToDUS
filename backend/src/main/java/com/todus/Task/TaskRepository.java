package com.todus.task;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import org.springframework.stereotype.Repository;

import com.todus.enums.Status;
import com.todus.user.User;


@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {
    List<Task> findByCategoryId(Long categoryId);
    List<Task> findByUserId(Long userId);
    List<Task> findByUser(User user);
    List<Task> findAll();
    List<Task> findByUserAndTrashed(User user, Boolean trashed);
    List<Task> findByUserAndTrashedAndCategoryId(User user, Boolean trashed, Long categoryId);
    List<Task> findByPriorityId(Long priorityId);

    long countByUserIdAndTrashedFalse(Long userId);
    long countByUserIdAndStatusAndTrashedFalse(Long userId, Status status);
    long countByUserIdAndStatusNotAndTrashedFalse(Long userId, Status status);
    long countByUserIdAndRescheduledTrue(Long userId);
    long countByUserIdAndDueDateBeforeAndStatusNotAndTrashedFalse(Long userId, LocalDateTime now, Status status);
    List<Task> findByUserIdAndStatusAndCompletedAtAfter(Long userId, Status status, LocalDateTime after);
    long countByUserIdAndTrashedTrue(Long userId);
    long countByUserIdAndDateCreatedBetween(Long userId, LocalDateTime start, LocalDateTime end);

    @Query("SELECT t.category.name, COUNT(t) FROM Task t WHERE t.user.id = :userId GROUP BY t.category.name")
    List<Object[]> countGroupByCategory(@Param("userId") Long userId);

    @Query("SELECT t.priority.name, COUNT(t) FROM Task t WHERE t.user.id = :userId GROUP BY t.priority.name")
    List<Object[]> countGroupByPriority(@Param("userId") Long userId);

    @Query("SELECT HOUR(t.completedAt), COUNT(t) FROM Task t WHERE t.user.id = :userId AND t.status = 'COMPLETED' GROUP BY HOUR(t.completedAt)")
    List<Object[]> countByCompletedHour(@Param("userId") Long userId);


}
