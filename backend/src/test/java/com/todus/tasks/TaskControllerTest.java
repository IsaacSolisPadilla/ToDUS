package com.todus.tasks;


import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.todus.user.AuthService;
import com.todus.user.User;
import com.todus.util.JwtUtil;
import com.todus.task.TaskService;
import com.todus.task.TaskController;
import com.todus.task.Task;
import com.todus.task.TaskDTO;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;

import java.util.List;
import java.util.Map;

@SpringBootTest
@AutoConfigureMockMvc(addFilters = false)
public class TaskControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private TaskService taskService;

    @MockBean
    private AuthService authService;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private JwtUtil jwtUtil;

    @Test
    void testCreateTaskSuccess() throws Exception {
        TaskDTO taskDTO = new TaskDTO();
        taskDTO.setName("Nueva tarea");
        taskDTO.setDescription("Descripción de prueba");
        taskDTO.setPriorityId(1L);

        when(taskService.createTask(anyString(), any(TaskDTO.class)))
                .thenReturn(Map.of("message", "Tarea creada con éxito"));

        mockMvc.perform(MockMvcRequestBuilders.post("/api/tasks/create")
                .header("Authorization", "Bearer token123")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(taskDTO)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Tarea creada con éxito"));
    }

    @Test
    void testCreateTaskFailure() throws Exception {
        TaskDTO taskDTO = new TaskDTO();
        taskDTO.setName("Tarea inválida");

        when(taskService.createTask(anyString(), any(TaskDTO.class)))
                .thenThrow(new RuntimeException("Error al crear la tarea"));

        mockMvc.perform(MockMvcRequestBuilders.post("/api/tasks/create")
                .header("Authorization", "Bearer token123")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(taskDTO)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Error al crear la tarea"));
    }

    @Test
    void testGetTasksByUser() throws Exception {
        User mockUser = new User();
        mockUser.setId(1L);
        mockUser.setEmail("test@example.com");

        Task task = new Task();
        task.setId(1L);
        task.setName("Tarea prueba");
        task.setDescription("Descripción");

        when(authService.getAuthenticatedUser(anyString())).thenReturn(mockUser);
        when(taskService.getTasksByUser(any(User.class))).thenReturn(List.of(task));

        mockMvc.perform(MockMvcRequestBuilders.get("/api/tasks/list")
                .header("Authorization", "Bearer token123"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].name").value("Tarea prueba"));
    }

    @Test
    void testMarkTaskAsCompletedSuccess() throws Exception {
        when(taskService.markTaskAsCompleted(eq("Bearer token123"), eq(1L)))
                .thenReturn(Map.of("message", "Tarea marcada como completada"));

        mockMvc.perform(MockMvcRequestBuilders.put("/api/tasks/complete/1")
                .header("Authorization", "Bearer token123"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Tarea marcada como completada"));
    }

    @Test
    void testMarkTaskAsCompletedError() throws Exception {
        when(taskService.markTaskAsCompleted(eq("Bearer token123"), eq(99L)))
                .thenThrow(new RuntimeException("No tienes permisos para modificar esta tarea"));

        mockMvc.perform(MockMvcRequestBuilders.put("/api/tasks/complete/99")
                .header("Authorization", "Bearer token123"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("No tienes permisos para modificar esta tarea"));
    }

    @Test
    void testUpdateTaskSuccess() throws Exception {
        TaskDTO updatedTask = new TaskDTO();
        updatedTask.setName("Tarea actualizada");
        updatedTask.setDescription("Desc nueva");

        when(taskService.updateTask(eq("Bearer token123"), eq(1L), any(TaskDTO.class)))
                .thenReturn(Map.of("message", "Tarea actualizada con éxito"));

        mockMvc.perform(MockMvcRequestBuilders.put("/api/tasks/update/1")
                .header("Authorization", "Bearer token123")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updatedTask)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Tarea actualizada con éxito"));
    }

    @Test
    void testDeleteTaskSuccess() throws Exception {
        when(taskService.deleteTask(eq("Bearer token123"), eq(1L)))
                .thenReturn(Map.of("message", "Tarea eliminada correctamente"));

        mockMvc.perform(MockMvcRequestBuilders.delete("/api/tasks/1")
                .header("Authorization", "Bearer token123"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Tarea eliminada correctamente"));
    }

    @Test
    void testDeleteTaskError() throws Exception {
        when(taskService.deleteTask(eq("Bearer token123"), eq(999L)))
                .thenThrow(new RuntimeException("No tienes permisos para eliminar esta tarea"));

        mockMvc.perform(MockMvcRequestBuilders.delete("/api/tasks/999")
                .header("Authorization", "Bearer token123"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("No tienes permisos para eliminar esta tarea"));
    }
}

