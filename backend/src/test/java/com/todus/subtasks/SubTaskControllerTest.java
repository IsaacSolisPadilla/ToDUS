package com.todus.subtasks;

import com.todus.task.Task;
import com.todus.task.TaskService;
import com.todus.enums.Status;
import com.todus.subTask.SubTask;
import com.todus.subTask.SubTaskDTO;
import com.todus.subTask.SubTaskService;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc(addFilters = false)
class SubTaskControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private SubTaskService subTaskService;

    @MockBean
    private TaskService taskService;

    @Test
    void testCreateSubTask() throws Exception {
        long taskId = 123L;
        // Datos de entrada DTO
        String dtoJson = """
            {
              "name": "Revisar código",
              "status": "PENDENT"
            }
            """;

        // Simulación del Task existente
        Task task = new Task();
        task.setId(taskId);
        task.setName("Tarea principal");
        when(taskService.getTaskById(taskId)).thenReturn(task);

        // Simulación de la creación de la SubTask
        SubTask created = new SubTask();
        created.setId(10L);
        created.setName("Revisar código");
        created.setStatus(Status.PENDENT);
        created.setTask(task);
        when(subTaskService.createSubTask(any(SubTaskDTO.class), eq(task))).thenReturn(created);

        mockMvc.perform(post("/api/subtasks/create/{taskId}", taskId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(dtoJson))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(10))
                .andExpect(jsonPath("$.name").value("Revisar código"))
                .andExpect(jsonPath("$.status").value("PENDENT"));
    }

    @Test
    void testDeleteSubTask() throws Exception {
        long subTaskId = 55L;
        // No lanzamos excepción → OK
        doNothing().when(subTaskService).deleteSubTask(subTaskId);

        mockMvc.perform(delete("/api/subtasks/delete/{id}", subTaskId))
                .andExpect(status().isOk())
                .andExpect(content().string("Subtarea eliminada exitosamente"));

        verify(subTaskService, times(1)).deleteSubTask(subTaskId);
    }

    @Test
    void testUpdateSubTask() throws Exception {
        long subTaskId = 77L;
        String updateJson = """
            {
              "name": "Escribir tests",
              "status": "COMPLETED"
            }
            """;

        SubTask updated = new SubTask();
        updated.setId(subTaskId);
        updated.setName("Escribir tests");
        updated.setStatus(Status.COMPLETED);

        when(subTaskService.updateSubTask(eq(subTaskId), any(SubTaskDTO.class)))
                .thenReturn(updated);

        mockMvc.perform(put("/api/subtasks/update/{id}", subTaskId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(updateJson))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(77))
                .andExpect(jsonPath("$.name").value("Escribir tests"))
                .andExpect(jsonPath("$.status").value("COMPLETED"));
    }

    @Test
    void testCompleteSubTask() throws Exception {
        long subTaskId = 88L;

        SubTask completed = new SubTask();
        completed.setId(subTaskId);
        completed.setName("Revisar PR");
        completed.setStatus(Status.COMPLETED);

        when(subTaskService.completeSubTask(subTaskId)).thenReturn(completed);

        mockMvc.perform(put("/api/subtasks/complete/{id}", subTaskId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(88))
                .andExpect(jsonPath("$.name").value("Revisar PR"))
                .andExpect(jsonPath("$.status").value("COMPLETED"));
    }

    @Test
    void testGetSubTasksByTask() throws Exception {
        long taskId = 200L;

        SubTask st1 = new SubTask();
        st1.setId(1L);
        st1.setName("Sub 1");
        st1.setStatus(Status.PENDENT);

        SubTask st2 = new SubTask();
        st2.setId(2L);
        st2.setName("Sub 2");
        st2.setStatus(Status.COMPLETED);

        when(subTaskService.getSubTasksByTask(taskId)).thenReturn(List.of(st1, st2));

        mockMvc.perform(get("/api/subtasks/task/{taskId}", taskId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1))
                .andExpect(jsonPath("$[0].name").value("Sub 1"))
                .andExpect(jsonPath("$[0].status").value("PENDENT"))
                .andExpect(jsonPath("$[1].id").value(2))
                .andExpect(jsonPath("$[1].status").value("COMPLETED"));
    }
}

