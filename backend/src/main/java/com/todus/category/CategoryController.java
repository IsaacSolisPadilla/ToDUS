package com.todus.category;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/categories")
public class CategoryController {

    @Autowired
    private CategoryService categoryService;

    // CREAR CATEGORÍA
    @PostMapping("/create")
    public ResponseEntity<?> createCategory(@RequestHeader("Authorization") String token,
                                            @RequestBody CategoryDTO categoryRequest) {
        try {
            Map<String, String> response = categoryService.createCategory(token, categoryRequest);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // LISTAR TODAS LAS CATEGORÍAS DEL USUARIO AUTENTICADO
    @GetMapping("/all")
    public ResponseEntity<?> getAllUserCategories(@RequestHeader("Authorization") String token) {
        try {
            List<Category> categories = categoryService.getAllUserCategories(token);
            return ResponseEntity.ok(categories);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ELIMINAR CATEGORÍA POR ID
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<?> deleteCategory(@RequestHeader("Authorization") String token,
                                            @PathVariable Long id) {
        try {
            Map<String, String> response = categoryService.deleteCategory(token, id);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ACTUALIZAR CATEGORÍA POR ID
    @PutMapping("/update/{id}")
    public ResponseEntity<?> updateCategory(@RequestHeader("Authorization") String token,
                                            @PathVariable Long id,
                                            @RequestBody CategoryDTO categoryRequest) {
        try {
            Map<String, String> response = categoryService.updateCategory(token, id, categoryRequest);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
