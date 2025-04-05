package com.todus.priority;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;


public interface PriorityRepository extends JpaRepository<Priority, Long> {
    Optional<Priority> findById(Long id);
    List<Priority> findAll();

    
}