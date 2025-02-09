package com.todus.repository;


import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.JpaRepository;

import com.todus.model.Task;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {
    
}
