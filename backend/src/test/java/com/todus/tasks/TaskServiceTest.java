package com.todus.tasks;

import com.todus.category.Category;
import com.todus.category.CategoryRepository;
import com.todus.enums.Status;
import com.todus.priority.Priority;
import com.todus.priority.PriorityRepository;
import com.todus.task.Task;
import com.todus.task.TaskDTO;
import com.todus.task.TaskRepository;
import com.todus.task.TaskService;
import com.todus.user.User;
import com.todus.user.UserRepository;
import com.todus.util.JwtUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.cglib.core.Local;

import java.time.LocalDateTime;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TaskServiceTest {

    @Mock private TaskRepository taskRepository;
    @Mock private CategoryRepository categoryRepository;
    @Mock private PriorityRepository priorityRepository;
    @Mock private UserRepository userRepository;
    @Mock private JwtUtil jwtUtil;

    @InjectMocks private TaskService taskService;

    private final String token = "Bearer abc.def.ghi";
    private User user;

    @BeforeEach
    void setUp() {
        user = new User();
        user.setId(1L);
        user.setEmail("u@x.com");
        // allow null safety for auth in methods that call getAuthenticatedUser
        lenient().when(jwtUtil.extractEmail("abc.def.ghi")).thenReturn("u@x.com");
        lenient().when(userRepository.findByEmail("u@x.com")).thenReturn(Optional.of(user));
    }

    @Test
    void getAuthenticatedUser_success() {
        User result = taskService.getAuthenticatedUser(token);
        assertSame(user, result);
    }

    @Test
    void getAuthenticatedUser_notFound_throws() {
        when(userRepository.findByEmail("u@x.com")).thenReturn(Optional.empty());
        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> taskService.getAuthenticatedUser(token));
        assertEquals("Usuario no encontrado", ex.getMessage());
    }

    @Test
    void getTaskById_found() {
        Task t = new Task(); t.setId(5L);
        when(taskRepository.findById(5L)).thenReturn(Optional.of(t));
        Task result = taskService.getTaskById(5L);
        assertSame(t, result);
    }

    @Test
    void getTaskById_notFound_throws() {
        when(taskRepository.findById(9L)).thenReturn(Optional.empty());
        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> taskService.getTaskById(9L));
        assertEquals("Tarea no encontrada", ex.getMessage());
    }

    @Test
    void createTask_success_withAndWithoutCategory() {
        // Prepare DTO
        TaskDTO dto = new TaskDTO();
        dto.setName("T1");
        dto.setDescription("D1");
        dto.setDueDate(null);
        dto.setPriorityId(2L);
        dto.setCategoryId(null);

        Priority pr = new Priority(); pr.setId(2L);
        when(priorityRepository.findById(2L)).thenReturn(Optional.of(pr));

        Map<String,String> resp = taskService.createTask(token, dto);
        assertEquals("Tarea creada con éxito", resp.get("message"));

        ArgumentCaptor<Task> cap = ArgumentCaptor.forClass(Task.class);
        verify(taskRepository).save(cap.capture());
        Task saved = cap.getValue();
        assertEquals("T1", saved.getName());
        assertEquals("D1", saved.getDescription());
        assertNull(saved.getDueDate());
        assertSame(user, saved.getUser());
        assertNull(saved.getCategory());
        assertSame(pr, saved.getPriority());
        assertEquals(Status.PENDENT, saved.getStatus());
        assertFalse(saved.getTrashed());

        // Now with category
        dto.setCategoryId(7L);
        Category cat = new Category(); cat.setId(7L);
        when(categoryRepository.findById(7L)).thenReturn(Optional.of(cat));
        taskService.createTask(token, dto);
        verify(categoryRepository).findById(7L);
    }

    @Test
    void createTask_missingPriority_throws() {
        TaskDTO dto = new TaskDTO();
        dto.setPriorityId(99L);
        when(priorityRepository.findById(99L)).thenReturn(Optional.empty());
        RuntimeException ex = assertThrows(RuntimeException.class,
            () -> taskService.createTask(token, dto));
        assertEquals("Prioridad no encontrada", ex.getMessage());
    }

    @Test
    void getTasksByUser_returnsList() {
        List<Task> list = List.of(new Task(), new Task());
        when(taskRepository.findByUser(user)).thenReturn(list);
        List<Task> res = taskService.getTasksByUser(user);
        assertSame(list, res);
    }

    @Test
    void markTaskAsCompleted_togglePendingToCompleted() {
        Task t = new Task(); t.setId(11L); t.setUser(user); t.setStatus(Status.PENDENT);
        when(taskRepository.findById(11L)).thenReturn(Optional.of(t));
        Map<String,String> resp = taskService.markTaskAsCompleted(token, 11L);

        assertEquals("Tarea marcada como completada", resp.get("message"));
        assertEquals(Status.COMPLETED, t.getStatus());
        assertNotNull(t.getCompletedAt());
        verify(taskRepository).save(t);
    }

    @Test
    void markTaskAsCompleted_toggleCompletedToPending() {
        Task t = new Task(); t.setId(12L); t.setUser(user); t.setStatus(Status.COMPLETED);
        LocalDateTime before = LocalDateTime.of(2025,5,1,0,0);
        t.setCompletedAt(before);
        when(taskRepository.findById(12L)).thenReturn(Optional.of(t));

        Map<String,String> resp = taskService.markTaskAsCompleted(token, 12L);
        assertEquals("Tarea vuelta a pendiente", resp.get("message"));
        assertEquals(Status.PENDENT, t.getStatus());
        assertNull(t.getCompletedAt());
    }

    @Test
    void markTaskAsCompleted_notFound_throws() {
        when(taskRepository.findById(20L)).thenReturn(Optional.empty());
        RuntimeException ex = assertThrows(RuntimeException.class,
            () -> taskService.markTaskAsCompleted(token, 20L));
        assertEquals("Tarea no encontrada", ex.getMessage());
    }

    @Test
    void markTaskAsCompleted_noPermission_throws() {
        User other = new User(); other.setId(99L);
        Task t = new Task(); t.setId(30L); t.setUser(other);
        when(taskRepository.findById(30L)).thenReturn(Optional.of(t));
        RuntimeException ex = assertThrows(RuntimeException.class,
            () -> taskService.markTaskAsCompleted(token, 30L));
        assertEquals("No tienes permisos para modificar esta tarea", ex.getMessage());
    }

    @Test
    void updateTask_success_andRescheduledFlag() {
        Task t = new Task();
        t.setId(40L);
        t.setUser(user);
        t.setDueDate(LocalDateTime.of(2025,5,1,12,0));
        when(taskRepository.findById(40L)).thenReturn(Optional.of(t));

        TaskDTO dto = new TaskDTO();
        dto.setName("X"); dto.setDescription("Y");
        dto.setDueDate(LocalDateTime.of(2025,5,2,12,0));
        dto.setPriorityId(null);
        dto.setCategoryId(null);

        Map<String,String> resp = taskService.updateTask(token, 40L, dto);
        assertEquals("Tarea actualizada con éxito", resp.get("message"));
        assertTrue(t.getRescheduled());
        assertEquals(dto.getDueDate(), t.getDueDate());
    }

    @Test
    void updateTask_changePriorityAndCategory() {
        Task t = new Task(); t.setId(50L); t.setUser(user);
        t.setDueDate(null);
        when(taskRepository.findById(50L)).thenReturn(Optional.of(t));

        TaskDTO dto = new TaskDTO();
        dto.setName("N"); dto.setDescription("D");
        dto.setDueDate(null);
        dto.setPriorityId(2L);
        dto.setCategoryId(3L);
        dto.setDueDate(LocalDateTime.of(2025,5,2,12,0));

        Priority pr = new Priority(); pr.setId(2L);
        Category cat = new Category(); cat.setId(3L);
        when(priorityRepository.findById(2L)).thenReturn(Optional.of(pr));
        when(categoryRepository.findById(3L)).thenReturn(Optional.of(cat));

        taskService.updateTask(token, 50L, dto);
        assertSame(pr, t.getPriority());
        assertSame(cat, t.getCategory());
    }

    @Test
    void updateTask_notFound_throws() {
        when(taskRepository.findById(60L)).thenReturn(Optional.empty());
        RuntimeException ex = assertThrows(RuntimeException.class,
            () -> taskService.updateTask(token, 60L, new TaskDTO()));
        assertEquals("Tarea no encontrada", ex.getMessage());
    }

    @Test
    void updateTask_noPermission_throws() {
        User other = new User(); other.setId(100L);
        Task t = new Task(); t.setId(70L); t.setUser(other);
        when(taskRepository.findById(70L)).thenReturn(Optional.of(t));
        RuntimeException ex = assertThrows(RuntimeException.class,
            () -> taskService.updateTask(token, 70L, new TaskDTO()));
        assertEquals("No tienes permisos para modificar esta tarea", ex.getMessage());
    }

    @Test
    void deleteTask_success() {
        Task t = new Task(); t.setId(80L); t.setUser(user);
        when(taskRepository.findById(80L)).thenReturn(Optional.of(t));
        Map<String,String> resp = taskService.deleteTask(token, 80L);
        assertEquals("Tarea eliminada correctamente", resp.get("message"));
        verify(taskRepository).delete(t);
    }

    @Test
    void deleteTask_notFound_throws() {
        when(taskRepository.findById(90L)).thenReturn(Optional.empty());
        RuntimeException ex = assertThrows(RuntimeException.class,
            () -> taskService.deleteTask(token, 90L));
        assertEquals("Tarea no encontrada", ex.getMessage());
    }

    @Test
    void deleteTask_noPermission_throws() {
        User other = new User(); other.setId(2L);
        Task t = new Task(); t.setId(91L); t.setUser(other);
        when(taskRepository.findById(91L)).thenReturn(Optional.of(t));
        RuntimeException ex = assertThrows(RuntimeException.class,
            () -> taskService.deleteTask(token, 91L));
        assertEquals("No tienes permisos para eliminar esta tarea", ex.getMessage());
    }

    @Test
    void deleteAllTrashedTasks_emptyList() {
        when(taskRepository.findByUserAndTrashed(user, true)).thenReturn(Collections.emptyList());
        Map<String,String> resp = taskService.deleteAllTrashedTasks(token, null);
        assertEquals("No hay tareas en la papelera para eliminar", resp.get("message"));
    }

    @Test
    void deleteAllTrashedTasks_withCategory() {
        Task t1 = new Task(); t1.setId(100L); t1.setTrashed(true);
        List<Task> list = List.of(t1);
        when(taskRepository.findByUserAndTrashedAndCategoryId(user, true, 5L)).thenReturn(list);
        Map<String,String> resp = taskService.deleteAllTrashedTasks(token, 5L);
        assertEquals("Todas las tareas en la papelera han sido eliminadas correctamente", resp.get("message"));
        verify(taskRepository).deleteAll(list);
    }

    @Test
    void trashAndRecoverTask() {
        Task t = new Task(); t.setId(120L); t.setUser(user); t.setTrashed(false);
        when(taskRepository.findById(120L)).thenReturn(Optional.of(t))
                                         .thenReturn(Optional.of(t)); // for recover
        Map<String,String> resp1 = taskService.trashTask(token, 120L);
        assertTrue(t.getTrashed());
        assertNotNull(t.getDateTrashed());
        assertEquals("Tarea movida a la papelera correctamente", resp1.get("message"));

        Map<String,String> resp2 = taskService.recoverTask(token, 120L);
        assertFalse(t.getTrashed());
        assertNull(t.getDateTrashed());
        assertEquals("Tarea recuperada con éxito", resp2.get("message"));
    }

    @Test
    void getTrashedTasks_filtersByCategoryId() {
        Task a = new Task(); a.setTrashed(true);
        Task b = new Task(); b.setTrashed(true);
        Category cat1 = new Category(); cat1.setId(1L);
        a.setCategory(cat1);
        b.setCategory(null);
        when(taskRepository.findByUserAndTrashed(user, true)).thenReturn(List.of(a, b));

        List<Task> resAll = taskService.getTrashedTasks(user, null);
        assertEquals(2, resAll.size());

        List<Task> resFiltered = taskService.getTrashedTasks(user, 1L);
        assertEquals(1, resFiltered.size());
        assertSame(a, resFiltered.get(0));
    }
}

