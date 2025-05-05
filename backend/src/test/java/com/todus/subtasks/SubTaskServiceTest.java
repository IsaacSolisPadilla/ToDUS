package com.todus.subtasks;

import com.todus.enums.Status;
import com.todus.subTask.SubTask;
import com.todus.subTask.SubTaskDTO;
import com.todus.subTask.SubTaskRepository;
import com.todus.subTask.SubTaskService;
import com.todus.task.Task;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SubTaskServiceTest {

    @Mock
    private SubTaskRepository subTaskRepository;

    @InjectMocks
    private SubTaskService subTaskService;

    private Task parentTask;
    private SubTaskDTO dto;

    @BeforeEach
    void setUp() {
        parentTask = new Task();
        parentTask.setId(100L);
        parentTask.setName("Parent Task");

        dto = new SubTaskDTO();
        dto.setName("Check tests");
        dto.setStatus(Status.COMPLETED);
    }

    @Test
    void createSubTask_savesWithDefaultStatus() {
        // Prepare stub for save
        ArgumentCaptor<SubTask> captor = ArgumentCaptor.forClass(SubTask.class);
        SubTask saved = new SubTask();
        saved.setId(1L);
        when(subTaskRepository.save(any(SubTask.class))).thenReturn(saved);

        SubTask result = subTaskService.createSubTask(dto, parentTask);

        // Verify
        verify(subTaskRepository).save(captor.capture());
        SubTask toSave = captor.getValue();
        assertEquals("Check tests", toSave.getName());
        assertEquals(Status.PENDENT, toSave.getStatus()); // default in service
        assertSame(parentTask, toSave.getTask());

        assertEquals(1L, result.getId());
    }

    @Test
    void deleteSubTask_delegatesToRepository() {
        // Should not throw
        doNothing().when(subTaskRepository).deleteById(200L);
        subTaskService.deleteSubTask(200L);
        verify(subTaskRepository).deleteById(200L);
    }

    @Test
    void updateSubTask_whenExists_updatesAndReturns() {
        SubTask existing = new SubTask();
        existing.setId(10L);
        existing.setName("Old name");
        existing.setStatus(Status.PENDENT);

        when(subTaskRepository.findById(10L)).thenReturn(Optional.of(existing));
        when(subTaskRepository.save(existing)).thenReturn(existing);

        dto.setName("New name");
        dto.setStatus(Status.COMPLETED);
        SubTask result = subTaskService.updateSubTask(10L, dto);

        assertEquals("New name", result.getName());
        assertEquals(Status.COMPLETED, result.getStatus());
        verify(subTaskRepository).findById(10L);
        verify(subTaskRepository).save(existing);
    }

    @Test
    void updateSubTask_whenNotFound_throws() {
        when(subTaskRepository.findById(30L)).thenReturn(Optional.empty());
        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> subTaskService.updateSubTask(30L, dto));
        assertEquals("Subtarea no encontrada", ex.getMessage());
    }

    @Test
    void completeSubTask_toggleFromPendentToCompleted() {
        SubTask existing = new SubTask();
        existing.setId(50L);
        existing.setStatus(Status.PENDENT);

        when(subTaskRepository.findById(50L)).thenReturn(Optional.of(existing));
        when(subTaskRepository.save(existing)).thenReturn(existing);

        SubTask result = subTaskService.completeSubTask(50L);
        assertEquals(Status.COMPLETED, result.getStatus());
        verify(subTaskRepository).findById(50L);
        verify(subTaskRepository).save(existing);
    }

    @Test
    void completeSubTask_toggleFromCompletedToPendent() {
        SubTask existing = new SubTask();
        existing.setId(60L);
        existing.setStatus(Status.COMPLETED);

        when(subTaskRepository.findById(60L)).thenReturn(Optional.of(existing));
        when(subTaskRepository.save(existing)).thenReturn(existing);

        SubTask result = subTaskService.completeSubTask(60L);
        assertEquals(Status.PENDENT, result.getStatus());
    }

    @Test
    void completeSubTask_whenNotFound_throws() {
        when(subTaskRepository.findById(70L)).thenReturn(Optional.empty());
        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> subTaskService.completeSubTask(70L));
        assertEquals("Subtarea no encontrada", ex.getMessage());
    }

    @Test
    void getSubTasksByTask_filtersByTaskId() {
        SubTask st1 = new SubTask();
        SubTask st2 = new SubTask();
        List<SubTask> list = List.of(st1, st2);
        when(subTaskRepository.findByTaskId(999L)).thenReturn(list);

        List<SubTask> result = subTaskService.getSubTasksByTask(999L);
        assertSame(list, result);
    }
}

