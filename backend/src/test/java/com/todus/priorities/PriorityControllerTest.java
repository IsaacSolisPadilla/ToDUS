package com.todus.priorities;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.todus.enums.Color;
import com.todus.task.Priority;
import com.todus.task.PriorityController;
import com.todus.task.PriorityRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc(addFilters = false)
public class PriorityControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private PriorityRepository priorityRepository;



    @Test
    void testListPriorities() throws Exception {
        Priority p1 = new Priority();
        p1.setId(1L);
        p1.setName("Alta");
        p1.setColor(Color.RED);

        Priority p2 = new Priority();
        p2.setId(2L);
        p2.setName("Media");
        p2.setColor(Color.YELLOW);

        when(priorityRepository.findAll()).thenReturn(List.of(p1, p2));

        mockMvc.perform(MockMvcRequestBuilders.get("/api/priorities/all"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].name").value("Alta"))
                .andExpect(jsonPath("$[1].name").value("Media"));
    }

}
