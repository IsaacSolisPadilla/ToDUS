package com.todus.priorities;

import com.todus.priority.Priority;
import com.todus.priority.PriorityRepository;
import com.todus.priority.PriorityService;
import com.todus.task.Task;
import com.todus.task.TaskRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PriorityServiceTest {

    @Mock
    private PriorityRepository priorityRepository;

    @Mock
    private TaskRepository taskRepository;

    @InjectMocks
    private PriorityService priorityService;

    @Test
    void getAllPriorities_returnsAll() {
        Priority p1 = new Priority();
        p1.setId(1L);
        p1.setName("Alta");
        Priority p2 = new Priority();
        p2.setId(2L);
        p2.setName("Media");    
        List<Priority> list = List.of(p1, p2);
        when(priorityRepository.findAll()).thenReturn(list);
        List<Priority> result = priorityService.getAllPriorities();
        assertSame(list, result);
        verify(priorityRepository).findAll();
    }

    @Test
    void findById_found() {
        Priority p = new Priority();
        p.setId(5L);
        p.setName("Baja");

        when(priorityRepository.findById(5L)).thenReturn(Optional.of(p));

        Optional<Priority> maybe = priorityService.findById(5L);
        assertTrue(maybe.isPresent());
        assertEquals(p, maybe.get());
        verify(priorityRepository).findById(5L);
    }

    @Test
    void findById_notFound() {
        when(priorityRepository.findById(99L)).thenReturn(Optional.empty());

        Optional<Priority> maybe = priorityService.findById(99L);
        assertFalse(maybe.isPresent());
        verify(priorityRepository).findById(99L);
    }

    @Test
    void save_delegatesToRepository() {
        Priority toSave = new Priority();
        toSave.setName("Urgente");

        Priority saved = new Priority();
        saved.setId(10L);
        saved.setName("Urgente");

        when(priorityRepository.save(toSave)).thenReturn(saved);

        Priority result = priorityService.save(toSave);
        assertSame(saved, result);
        verify(priorityRepository).save(toSave);
    }

    @Test
    void hasTasksWithPriority_whenTasksExist_returnsTrue() {
        List<Task> tasks = List.of(new Task(), new Task());
        when(taskRepository.findByPriorityId(7L)).thenReturn(tasks);

        boolean has = priorityService.hasTasksWithPriority(7L);
        assertTrue(has);
        verify(taskRepository).findByPriorityId(7L);
    }

    @Test
    void hasTasksWithPriority_whenNoTasks_returnsFalse() {
        when(taskRepository.findByPriorityId(8L)).thenReturn(Collections.emptyList());

        boolean has = priorityService.hasTasksWithPriority(8L);
        assertFalse(has);
        verify(taskRepository).findByPriorityId(8L);
    }
}

