package com.todus.studyMethod;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface StudyMethodRepository extends JpaRepository<StudyMethod, Long> {
    Optional<StudyMethod> findById(Long id);

}