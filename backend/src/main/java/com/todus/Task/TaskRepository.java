package com.todus.task;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import org.springframework.stereotype.Repository;
import com.todus.user.User;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {
    List<Task> findByCategoryId(Long categoryId);
    List<Task> findByUserId(Long userId);
    List<Task> findByUser(User user);
    List<Task> findAll();
}
