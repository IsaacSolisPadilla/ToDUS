package com.todus.task;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
import com.todus.task.Priority;

public interface PriorityRepository extends JpaRepository<Priority, Long> {
    Optional<Priority> findById(Long id);
}