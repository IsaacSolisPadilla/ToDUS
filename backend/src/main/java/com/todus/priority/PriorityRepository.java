package com.todus.priority;

import org.springframework.data.jpa.repository.JpaRepository;

import com.todus.user.User;

import java.util.List;
import java.util.Optional;


public interface PriorityRepository extends JpaRepository<Priority, Long> {
    Optional<Priority> findById(Long id);
    List<Priority> findAll();
    List<Priority> findByUserId(Long userId);
    long countByUser(User user);

    
}