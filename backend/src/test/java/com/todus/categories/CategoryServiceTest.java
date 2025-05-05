package com.todus.categories;

import com.todus.category.Category;
import com.todus.category.CategoryDTO;
import com.todus.category.CategoryRepository;
import com.todus.category.CategoryService;
import com.todus.enums.OrderTask;
import com.todus.image.Image;
import com.todus.image.ImageRepository;
import com.todus.studyMethod.StudyMethod;
import com.todus.studyMethod.StudyMethodRepository;
import com.todus.user.User;
import com.todus.user.UserRepository;
import com.todus.util.JwtUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CategoryServiceTest {

    @Mock private CategoryRepository categoryRepository;
    @Mock private UserRepository userRepository;
    @Mock private ImageRepository imageRepository;
    @Mock private StudyMethodRepository studyMethodRepository;
    @Mock private JwtUtil jwtUtil;

    @InjectMocks private CategoryService categoryService;

    private final String token = "Bearer abc.def.ghi";
    private final String email = "user@example.com";
    private User user;

    @BeforeEach
    void setUp() {
        user = new User();
        user.setId(42L);
        user.setEmail(email);

        // marcamos lenient para que no sean “necesarios”
        lenient().when(jwtUtil.extractEmail("abc.def.ghi")).thenReturn(email);
        lenient().when(userRepository.findByEmail(email)).thenReturn(Optional.of(user));
    }

    @Test
    void getAuthenticatedUser_success() {
        User result = categoryService.getAuthenticatedUser(token);
        assertSame(user, result);
    }

    @Test
    void getAuthenticatedUser_noSuchUser_throws() {
        when(userRepository.findByEmail(email)).thenReturn(Optional.empty());
        RuntimeException ex = assertThrows(RuntimeException.class,
            () -> categoryService.getAuthenticatedUser(token));
        assertEquals("Usuario no encontrado", ex.getMessage());
    }

    @Test
    void createCategory_success_withoutStudyMethod() {
        // Prepare DTO
        CategoryDTO dto = new CategoryDTO();
        dto.setName("Cat");
        dto.setDescription("Desc");
        dto.setOrderTasks(OrderTask.DATE_CREATED);
        dto.setImageId(7L);
        dto.setAutoDeleteComplete(true);
        dto.setDeleteCompleteDays(5);
        dto.setShowComplete(true);
        dto.setStudyMethodId(null);

        // Stub image lookup
        Image img = new Image();
        img.setId(7L);
        when(imageRepository.findById(7L)).thenReturn(Optional.of(img));

        // Call
        Map<String,String> resp = categoryService.createCategory(token, dto);

        // Verify
        assertEquals("Categoría creada con éxito", resp.get("message"));
        ArgumentCaptor<Category> captor = ArgumentCaptor.forClass(Category.class);
        verify(categoryRepository).save(captor.capture());

        Category saved = captor.getValue();
        assertEquals("Cat", saved.getName());
        assertEquals("Desc", saved.getDescription());
        assertEquals(OrderTask.DATE_CREATED, saved.getOrderTasks());
        assertSame(img, saved.getImage());
        assertSame(user, saved.getUser());
        assertTrue(saved.getAutoDeleteComplete());
        assertEquals(5, saved.getDeleteCompleteDays());
        assertTrue(saved.getShowComplete());
        assertNull(saved.getStudyMethod());
    }

    @Test
    void createCategory_withStudyMethod() {
        CategoryDTO dto = new CategoryDTO();
        dto.setName("X"); dto.setDescription(""); dto.setOrderTasks(OrderTask.DATE_CREATED);
        dto.setImageId(8L); dto.setStudyMethodId(3L);

        Image img = new Image(); img.setId(8L);
        when(imageRepository.findById(8L)).thenReturn(Optional.of(img));
        StudyMethod sm = mock(StudyMethod.class);
        when(studyMethodRepository.findById(3L)).thenReturn(Optional.of(sm));

        Map<String,String> resp = categoryService.createCategory(token, dto);
        assertEquals("Categoría creada con éxito", resp.get("message"));
        verify(categoryRepository).save(argThat(c ->
            c.getStudyMethod() == sm &&
            c.getImage() == img &&
            c.getUser() == user
        ));
    }

    @Test
    void createCategory_missingImageId_throws() {
        CategoryDTO dto = new CategoryDTO();
        dto.setImageId(null);
        RuntimeException ex = assertThrows(RuntimeException.class,
            () -> categoryService.createCategory(token, dto));
        assertEquals("La imagen es obligatoria para crear una categoría.", ex.getMessage());
    }

    @Test
    void createCategory_imageNotFound_throws() {
        CategoryDTO dto = new CategoryDTO();
        dto.setImageId(99L);
        when(imageRepository.findById(99L)).thenReturn(Optional.empty());

        RuntimeException ex = assertThrows(RuntimeException.class,
            () -> categoryService.createCategory(token, dto));
        assertEquals("Imagen no encontrada con ID: 99", ex.getMessage());
    }

    @Test
    void getAllUserCategories_returnsList() {
        List<Category> list = List.of(new Category(), new Category());
        when(categoryRepository.findAllByUser(user)).thenReturn(list);

        List<Category> result = categoryService.getAllUserCategories(token);
        assertSame(list, result);
    }

    @Test
    void updateCategory_success_withPermission() {
        Category existing = new Category();
        existing.setId(20L);
        existing.setUser(user);
        existing.setImage(new Image());  // initial image

        when(categoryRepository.findById(20L)).thenReturn(Optional.of(existing));

        CategoryDTO dto = new CategoryDTO();
        dto.setName("NewName");
        dto.setDescription("NewDesc");
        dto.setOrderTasks(OrderTask.DATE_CREATED);
        dto.setShowComplete(true);
        dto.setAutoDeleteComplete(false);
        dto.setDeleteCompleteDays(10);
        dto.setImageId(5L);
        dto.setStudyMethodId(null);

        Image newImg = new Image(); newImg.setId(5L);
        when(imageRepository.findById(5L)).thenReturn(Optional.of(newImg));

        Map<String,String> resp = categoryService.updateCategory(token, 20L, dto);
        assertEquals("Categoría actualizada con éxito", resp.get("message"));

        verify(categoryRepository).save(argThat(c ->
            c.getName().equals("NewName") &&
            c.getDescription().equals("NewDesc") &&
            c.getOrderTasks() == OrderTask.DATE_CREATED &&
            c.getShowComplete() &&
            !c.getAutoDeleteComplete() &&
            c.getDeleteCompleteDays().equals(10) &&
            c.getImage() == newImg
        ));
    }

    @Test
    void updateCategory_notFound_throws() {
        when(categoryRepository.findById(30L)).thenReturn(Optional.empty());
        RuntimeException ex = assertThrows(RuntimeException.class,
            () -> categoryService.updateCategory(token, 30L, new CategoryDTO()));
        assertEquals("Categoría no encontrada", ex.getMessage());
    }

    @Test
    void updateCategory_noPermission_throws() {
        User other = new User();
        other.setId(100L);
        Category existing = new Category();
        existing.setId(40L);
        existing.setUser(other);
        when(categoryRepository.findById(40L)).thenReturn(Optional.of(existing));

        RuntimeException ex = assertThrows(RuntimeException.class,
            () -> categoryService.updateCategory(token, 40L, new CategoryDTO()));
        assertEquals("No tienes permisos para modificar esta categoría", ex.getMessage());
    }

    @Test
    void deleteCategory_success() {
        Category existing = new Category();
        existing.setId(50L);
        existing.setUser(user);
        when(categoryRepository.findById(50L)).thenReturn(Optional.of(existing));

        Map<String,String> resp = categoryService.deleteCategory(token, 50L);
        assertEquals("Categoría eliminada correctamente", resp.get("message"));
        verify(categoryRepository).delete(existing);
    }

    @Test
    void deleteCategory_notFound_throws() {
        when(categoryRepository.findById(60L)).thenReturn(Optional.empty());
        RuntimeException ex = assertThrows(RuntimeException.class,
            () -> categoryService.deleteCategory(token, 60L));
        assertEquals("Categoría no encontrada", ex.getMessage());
    }

    @Test
    void deleteCategory_noPermission_throws() {
        User other = new User(); other.setId(200L);
        Category existing = new Category();
        existing.setId(70L);
        existing.setUser(other);
        when(categoryRepository.findById(70L)).thenReturn(Optional.of(existing));

        RuntimeException ex = assertThrows(RuntimeException.class,
            () -> categoryService.deleteCategory(token, 70L));
        assertEquals("No tienes permisos para eliminar esta categoría", ex.getMessage());
    }

    @Test
    void getAllCategories_returnsAll() {
        List<Category> all = List.of(new Category(), new Category(), new Category());
        when(categoryRepository.findAll()).thenReturn(all);

        List<Category> result = categoryService.getAllCategories();
        assertSame(all, result);
    }
}

