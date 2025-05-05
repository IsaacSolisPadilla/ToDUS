package com.todus.users;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.todus.user.AuthService;
import com.todus.user.ChangePasswordDTO;
import com.todus.user.RegisterDTO;
import com.todus.user.User;
import com.todus.user.UserRepository;

import io.jsonwebtoken.io.IOException;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Map;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc(addFilters = false)
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private AuthService authService;

    @MockBean
    private UserRepository userRepository;

    private final ObjectMapper mapper = new ObjectMapper();

    @Test
    void loginSuccess() throws Exception {
        // Dado que el servicio devuelve un token
        when(authService.login("u@t.com", "secret")).thenReturn("tok123");

        var payload = Map.of("email", "u@t.com", "password", "secret");

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(payload)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value("tok123"));
    }

    @Test
    void loginBadCredentials() throws Exception {
        // Si devuelve null o vacío → 401 “Usuario o contraseña incorrectos”
        when(authService.login(anyString(), anyString())).thenReturn(null);

        var payload = Map.of("email", "u@t.com", "password", "wrong");

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(payload)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.error").value("Usuario o contraseña incorrectos"));
    }

    @Test
    void loginEmptyEmail() throws Exception {
        // Aunque el servicio devolviera algo, el email vacío fuerza “Rellene los campos”
        when(authService.login(anyString(), anyString())).thenReturn("whatever");

        var payload = Map.of("email", "", "password", "secret");

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(payload)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.error").value("Rellene los campos"));
    }

    @Test
    void registerValidationErrors() throws Exception {
        // Envío un DTO vacío → debe devolver BAD_REQUEST con lista de errores
        RegisterDTO dto = new RegisterDTO(); 

        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(dto)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors").isArray())
                .andExpect(jsonPath("$.errors").value(org.hamcrest.Matchers.hasItem("El nombre es obligatorio.")))
                .andExpect(jsonPath("$.errors").value(org.hamcrest.Matchers.hasItem("El apellido es obligatorio.")))
                .andExpect(jsonPath("$.errors").value(org.hamcrest.Matchers.hasItem("El nombre de usuario es obligatorio.")))
                .andExpect(jsonPath("$.errors").value(org.hamcrest.Matchers.hasItem("El email es obligatorio.")))
                .andExpect(jsonPath("$.errors").value(org.hamcrest.Matchers.hasItem("La contraseña es obligatoria.")));
    }

    @Test
    void registerEmailAndNicknameTaken() throws Exception {
        // DTO parcialmente válido, pero email y nickname ya en uso
        RegisterDTO dto = new RegisterDTO();
        dto.setName("N");
        dto.setSurname("S");
        dto.setNickname("nick");
        dto.setEmail("x@x.com");
        dto.setPassword("Abc123");

        when(userRepository.findByEmail("x@x.com"))
                .thenReturn(Optional.of(new User()));
        when(userRepository.findByNickname("nick"))
                .thenReturn(Optional.of(new User()));

        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(dto)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors").isArray())
                .andExpect(jsonPath("$.errors").value(org.hamcrest.Matchers.hasItem("El email ya está en uso.")))
                .andExpect(jsonPath("$.errors").value(org.hamcrest.Matchers.hasItem("El nombre de usuario ya está en uso.")));
    }

    @Test
void registerSuccess() throws Exception {
    // Construyes el DTO sólo para rellenar el JSON
    RegisterDTO dto = new RegisterDTO();
    dto.setName("N");
    dto.setSurname("S");
    dto.setNickname("nick");
    dto.setEmail("x@x.com");
    dto.setPassword("Abc123");

    // El usuario que queremos que devuelva el mock
    User saved = new User();
    saved.setId(5L);
    saved.setName("N");
    saved.setSurname("S");
    saved.setNickname("nick");
    saved.setEmail("x@x.com");

    // Stubea el service usando any(...) en lugar de dto exacto
    when(userRepository.findByEmail("x@x.com")).thenReturn(Optional.empty());
    when(userRepository.findByNickname("nick")).thenReturn(Optional.empty());
    when(authService.registerUser(any(RegisterDTO.class))).thenReturn(saved);

    mockMvc.perform(post("/api/auth/register")
            .contentType(MediaType.APPLICATION_JSON)
            .content(mapper.writeValueAsString(dto)))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.id").value(5))
        .andExpect(jsonPath("$.email").value("x@x.com"))
        .andExpect(jsonPath("$.nickname").value("nick"));
}

@Test
void changePasswordSuccess() throws Exception {
    ChangePasswordDTO dto = new ChangePasswordDTO();
    dto.setOldPassword("old");
    dto.setNewPassword("New123");
    dto.setConfirmNewPassword("New123");

    Map<String, String> response = Map.of("message", "Cambiada");
    // stubeamos usando eq() para el token y any() para el DTO
    when(authService.changePassword(eq("Bearer tok"), any(ChangePasswordDTO.class)))
        .thenReturn(response);

    mockMvc.perform(post("/api/auth/change-password")
            .header("Authorization", "Bearer tok")
            .contentType(MediaType.APPLICATION_JSON)
            .content(mapper.writeValueAsString(dto)))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.message").value("Cambiada"));
}

@Test
void changePasswordBadRequest() throws Exception {
    ChangePasswordDTO dto = new ChangePasswordDTO();
    dto.setOldPassword("bad");
    dto.setNewPassword("New123");
    dto.setConfirmNewPassword("New123");

    // Usamos eq() para el token y any() para el DTO
    when(authService.changePassword(eq("Bearer tok"), any(ChangePasswordDTO.class)))
            .thenThrow(new RuntimeException("Clave incorrecta"));

    mockMvc.perform(post("/api/auth/change-password")
            .header(HttpHeaders.AUTHORIZATION, "Bearer tok")
            .contentType(MediaType.APPLICATION_JSON)
            .content(mapper.writeValueAsString(dto)))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.error").value("Clave incorrecta"));
}
}

