package com.todus.categories;

import com.todus.category.Category;
import com.todus.category.CategoryDTO;
import com.todus.category.CategoryService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.Map;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;


@SpringBootTest
@AutoConfigureMockMvc(addFilters = false)
public class CategoryControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private CategoryService categoryService;

    @Test
    void testGetAllCategories() throws Exception {
        Category c1 = new Category();
        c1.setId(1L);
        c1.setName("Work");

        Category c2 = new Category();
        c2.setId(2L);
        c2.setName("Personal");

        when(categoryService.getAllCategories()).thenReturn(List.of(c1, c2));

        mockMvc.perform(get("/api/categories/list"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].name").value("Work"))
                .andExpect(jsonPath("$[1].name").value("Personal"));
    }

    @Test
    void testGetAllUserCategories() throws Exception {
        Category c1 = new Category();
        c1.setId(10L);
        c1.setName("Estudio");

        when(categoryService.getAllUserCategories("dummy-token"))
                .thenReturn(List.of(c1));

        mockMvc.perform(get("/api/categories/all")
                .header("Authorization", "dummy-token"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(10))
                .andExpect(jsonPath("$[0].name").value("Estudio"));
    }

    @Test
    void testCreateCategory() throws Exception {
        Map<String, String> resp = Map.of("message", "Creada");
        when(categoryService.createCategory(eq("TK"), any(CategoryDTO.class)))
                .thenReturn(resp);

        String json = """
            {
              "name": "Nueva",
              "description": "Desc",
              "orderTasks": "DUE_DATE",
              "imageId": 5,
              "showComplete": true,
              "autoDeleteComplete": false,
              "deleteCompleteDays": 7,
              "studyMethodId": 3
            }
            """;

        mockMvc.perform(post("/api/categories/create")
                .header("Authorization", "TK")
                .contentType(MediaType.APPLICATION_JSON)
                .content(json))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Creada"));
    }

    @Test
    void testUpdateCategory() throws Exception {
        Map<String, String> resp = Map.of("message", "Actualizada");
        when(categoryService.updateCategory(eq("TK"), eq(42L), any(CategoryDTO.class)))
                .thenReturn(resp);

        String updateJson = """
            {
              "name": "Actualizada",
              "description": "Modificada"
            }
            """;

        mockMvc.perform(put("/api/categories/update/42")
                .header("Authorization", "TK")
                .contentType(MediaType.APPLICATION_JSON)
                .content(updateJson))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Actualizada"));
    }

    @Test
    void testDeleteCategory() throws Exception {
        Map<String, String> resp = Map.of("message", "Eliminada");
        when(categoryService.deleteCategory("TK", 99L))
                .thenReturn(resp);

        mockMvc.perform(delete("/api/categories/delete/99")
                .header("Authorization", "TK"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Eliminada"));
    }
}
