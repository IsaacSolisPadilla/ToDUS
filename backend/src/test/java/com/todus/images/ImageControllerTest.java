package com.todus.images;

import com.todus.enums.ImageType;
import com.todus.image.Image;
import com.todus.image.ImageRepository;

import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;


@SpringBootTest
@AutoConfigureMockMvc(addFilters = false)
class ImageControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ImageRepository imageRepository;

    private static final String ICON_FOLDER = "src/main/resources/static/icons/";
    private static final String CATEGORY_FOLDER = "src/main/resources/static/category/";
    private static final String TEST_FILENAME = "test-icon.png";

    @BeforeEach
    void setUp() throws Exception {
        // Asegurarnos de que el folder existe y crear un fichero de prueba
        Files.createDirectories(Paths.get(ICON_FOLDER));
        Path testFile = Paths.get(ICON_FOLDER).resolve(TEST_FILENAME);
        // Si no existe, lo creamos
        if (!Files.exists(testFile)) {
            Files.createFile(testFile);
        }
        // Y ahora escribimos algunos bytes para que no esté vacío
        Files.write(testFile, "dummy-content".getBytes());
    }

    @AfterEach
    void tearDown() throws Exception {
        // Borrar el fichero de prueba
        Path testFile = Paths.get(ICON_FOLDER).resolve(TEST_FILENAME);
        Files.deleteIfExists(testFile);
    }

    @Test
    void testListImages() throws Exception {
        Image img1 = new Image(); img1.setId(1L); img1.setImageUrl("a.png"); img1.setImageType(ImageType.USER);
        Image img2 = new Image(); img2.setId(2L); img2.setImageUrl("b.png"); img2.setImageType(ImageType.CATEGORY);

        when(imageRepository.findAll()).thenReturn(List.of(img1, img2));

        mockMvc.perform(get("/api/images/list"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].imageUrl").value("a.png"))
                .andExpect(jsonPath("$[1].imageType").value("CATEGORY"));
    }

    @Test
    void testListImagesByType() throws Exception {
        Image img = new Image(); img.setId(5L); img.setImageUrl("only.png"); img.setImageType(ImageType.USER);

        when(imageRepository.findByImageType(ImageType.USER)).thenReturn(List.of(img));

        mockMvc.perform(get("/api/images/list/USER"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(5))
                .andExpect(jsonPath("$[0].imageType").value("USER"));
    }

    @Test
    void testGetIcon_NotFound() throws Exception {
        // Petición de fichero que no existe en disco
        mockMvc.perform(get("/api/images/not-there.png"))
                .andExpect(status().isNotFound());
        // No debería tocar BBDD
        verify(imageRepository, never()).findByImageUrl(anyString());
        verify(imageRepository, never()).save(any());
    }

    @Test
    void testGetIcon_ExistsAndSaveNew() throws Exception {
        // Simulamos que no existía en BBDD
        when(imageRepository.findByImageUrl(TEST_FILENAME)).thenReturn(Optional.empty());

        mockMvc.perform(get("/api/images/" + TEST_FILENAME))
                .andExpect(status().isOk())
                .andExpect(header().string(HttpHeaders.CONTENT_DISPOSITION,
                        "inline; filename=\"" + TEST_FILENAME + "\""))
                .andExpect(content().contentType(MediaType.IMAGE_PNG));

        // Verificamos que, al no existir, hemos llamado a save(...)
        verify(imageRepository, times(1)).findByImageUrl(TEST_FILENAME);
        verify(imageRepository, times(1)).save(argThat(img ->
                TEST_FILENAME.equals(img.getImageUrl()) &&
                img.getImageType() == ImageType.USER
        ));
    }

    @Test
    void testGetIcon_ExistsButAlreadyInDb() throws Exception {
        // Simulamos que ya existía en BBDD
        Image existing = new Image();
        existing.setId(99L);
        existing.setImageUrl(TEST_FILENAME);
        existing.setImageType(ImageType.USER);

        when(imageRepository.findByImageUrl(TEST_FILENAME)).thenReturn(Optional.of(existing));

        mockMvc.perform(get("/api/images/" + TEST_FILENAME))
                .andExpect(status().isOk())
                .andExpect(header().string(HttpHeaders.CONTENT_DISPOSITION,
                        "inline; filename=\"" + TEST_FILENAME + "\""))
                .andExpect(content().contentType(MediaType.IMAGE_PNG));

        // No debe volver a guardar
        verify(imageRepository, times(1)).findByImageUrl(TEST_FILENAME);
        verify(imageRepository, never()).save(any());
    }
}

