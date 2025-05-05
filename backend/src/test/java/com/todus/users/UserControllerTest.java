package com.todus.users;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.todus.image.Image;
import com.todus.image.ImageRepository;
import com.todus.user.User;
import com.todus.user.UserRepository;

import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.web.servlet.MockMvc;

import java.util.*;

import static org.hamcrest.Matchers.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc(addFilters = false)
class UserControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private UserRepository userRepository;

    @MockBean
    private ImageRepository imageRepository;

    private final ObjectMapper mapper = new ObjectMapper();

    @AfterEach
    void clearSecurityContext() {
        SecurityContextHolder.clearContext();
    }

    // Helper to set an authenticated User in SecurityContext
    void authenticateAs(User user) {
        Authentication auth = new UsernamePasswordAuthenticationToken(user, null, List.of());
        SecurityContextHolder.getContext().setAuthentication(auth);
    }

    @Test
    void getProfile_Unauthenticated() throws Exception {
        // No authentication set
        mockMvc.perform(get("/api/user/profile"))
               .andExpect(status().isUnauthorized())
               .andExpect(content().string("Usuario no autenticado"));
    }

    @Test
    void getProfile_Success() throws Exception {
        User user = new User();
        user.setId(7L);
        user.setName("Juan");
        user.setSurname("Pérez");
        user.setNickname("jperez");
        user.setEmail("juan@ejemplo.com");

        Image img = new Image();
        img.setId(42L);
        img.setImageUrl("avatar.png");
        user.setImage(img);

        authenticateAs(user);

        mockMvc.perform(get("/api/user/profile"))
               .andExpect(status().isOk())
               .andExpect(jsonPath("$.name").value("Juan"))
               .andExpect(jsonPath("$.surname").value("Pérez"))
               .andExpect(jsonPath("$.nickname").value("jperez"))
               .andExpect(jsonPath("$.email").value("juan@ejemplo.com"))
               .andExpect(jsonPath("$.imageId").value(42))
               .andExpect(jsonPath("$.imageUrl").value("avatar.png"));
    }

    @Test
    void updateUser_Unauthenticated() throws Exception {
        Map<String,Object> body = new HashMap<>();
        body.put("name", "X");
        body.put("surname", "Y");
        body.put("nickname", "xy");
        body.put("email", "x@y.com");
        body.put("imageId", null);
        body.put("imageUrl", "");
    
        mockMvc.perform(put("/api/user/update")
                .contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(body)))
               .andExpect(status().isUnauthorized())
               .andExpect(content().string("Usuario no autenticado"));
    }
    
    @Test
    void updateUser_NotFound() throws Exception {
        User principal = new User();
        principal.setId(11L);
        authenticateAs(principal);
    
        when(userRepository.findById(11L)).thenReturn(Optional.empty());
    
        Map<String,Object> body = new HashMap<>();
        body.put("name", "X");
        body.put("surname", "Y");
        body.put("nickname", "xy");
        body.put("email", "x@y.com");
        body.put("imageId", null);
        body.put("imageUrl", "");
    
        mockMvc.perform(put("/api/user/update")
                .contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(body)))
               .andExpect(status().isNotFound())
               .andExpect(content().string("Usuario no encontrado"));
    }

    @Test
    void updateUser_ValidationErrors() throws Exception {
        User existing = new User();
        existing.setId(5L);
        existing.setEmail("old@old.com");
        existing.setNickname("nick1");
        authenticateAs(existing);

        when(userRepository.findById(5L)).thenReturn(Optional.of(existing));
        // imageRepository not needed for this test

        // Send empty name & surname to trigger validation
        Map<String,Object> body = Map.of(
            "name", "",
            "surname", "",
            "nickname", "",
            "email", "bad-email",
            "imageId", 99L,
            "imageUrl", ""
        );
        when(imageRepository.findById(99L)).thenReturn(Optional.empty());

        mockMvc.perform(put("/api/user/update")
                .contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(body)))
               .andExpect(status().isBadRequest())
               .andExpect(jsonPath("$.errors", hasItem("El nombre es obligatorio.")))
               .andExpect(jsonPath("$.errors", hasItem("El apellido es obligatorio.")))
               .andExpect(jsonPath("$.errors", hasItem("El nombre de usuario es obligatorio.")))
               .andExpect(jsonPath("$.errors", hasItem("El formato del email no es válido.")))
               .andExpect(jsonPath("$.errors", hasItem("Imagen no válida.")));
    }


    @Test
    void updateUser_Success_EmailAndImageChange() throws Exception {
        User existing = new User();
        existing.setId(8L);
        existing.setName("Luis");
        existing.setEmail("luis@old.com");
        existing.setNickname("lui8");
        authenticateAs(existing);

        when(userRepository.findById(8L)).thenReturn(Optional.of(existing));
        when(userRepository.findByEmail("luis@new.com")).thenReturn(Optional.empty());
        when(userRepository.findByNickname("lui8")).thenReturn(Optional.of(existing));

        Image newImg = new Image();
        newImg.setId(100L);
        newImg.setImageUrl("new.png");
        when(imageRepository.findById(100L)).thenReturn(Optional.of(newImg));

        Map<String,Object> body = Map.of(
            "name", "Luis Alberto",
            "surname", "Martínez",
            "nickname", "lui8",
            "email", "luis@new.com",   // different → triggers emailChanged
            "imageId", 100L,
            "imageUrl", "new.png"
        );

        mockMvc.perform(put("/api/user/update")
                .contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(body)))
               .andExpect(status().isOk())
               .andExpect(jsonPath("$.name").value("Luis Alberto"))
               .andExpect(jsonPath("$.email").value("luis@new.com"))
               .andExpect(jsonPath("$.imageId").value(100))
               .andExpect(jsonPath("$.imageUrl").value("new.png"))
               .andExpect(jsonPath("$.newToken").value(true));

        verify(userRepository).save(existing);
    }
}
