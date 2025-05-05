package com.todus.users;

import com.todus.image.Image;
import com.todus.image.ImageRepository;
import com.todus.user.AuthService;
import com.todus.user.ChangePasswordDTO;
import com.todus.user.RegisterDTO;
import com.todus.user.User;
import com.todus.user.UserRepository;
import com.todus.util.JwtUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock private UserRepository userRepository;
    @Mock private ImageRepository imageRepository;
    @Mock private PasswordEncoder passwordEncoder;
    @Mock private JwtUtil jwtUtil;

    @InjectMocks private AuthService authService;

    private final String token = "Bearer abc.def.ghi";
    private User user;

    @BeforeEach
    void setUp() {
        user = new User();
        user.setId(1L);
        user.setEmail("u@e.com");
        user.setPassword("encodedPwd");

        // allow getAuthenticatedUser in changePassword tests
        lenient().when(jwtUtil.extractEmail("abc.def.ghi")).thenReturn("u@e.com");
        lenient().when(userRepository.findByEmail("u@e.com")).thenReturn(Optional.of(user));
    }

    @Test
    void loginSuccess() {
        when(userRepository.findByEmail("u@e.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("rawPwd", "encodedPwd")).thenReturn(true);
        when(jwtUtil.generateToken("u@e.com")).thenReturn("tok123");

        String tok = authService.login("u@e.com", "rawPwd");
        assertEquals("tok123", tok);
        verify(userRepository).findByEmail("u@e.com");
        verify(passwordEncoder).matches("rawPwd", "encodedPwd");
        verify(jwtUtil).generateToken("u@e.com");
    }

    @Test
    void loginUserNotFoundThrows() {
        when(userRepository.findByEmail("x@x.com")).thenReturn(Optional.empty());
        RuntimeException ex = assertThrows(RuntimeException.class,
            () -> authService.login("x@x.com", "any"));
        assertEquals("Usuario no encontrado", ex.getMessage());
    }

    @Test
    void loginBadCredentialsThrows() {
        when(userRepository.findByEmail("u@e.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("bad", "encodedPwd")).thenReturn(false);

        RuntimeException ex = assertThrows(RuntimeException.class,
            () -> authService.login("u@e.com", "bad"));
        assertEquals("Credenciales incorrectas", ex.getMessage());
    }

    @Test
    void registerUserWithoutImage() {
        RegisterDTO dto = new RegisterDTO();
        dto.setName("N"); dto.setSurname("S");
        dto.setNickname("nick"); dto.setEmail("e@e.com");
        dto.setPassword("pwd123"); dto.setImageId(null);

        User saved = new User();
        saved.setId(5L);
        when(passwordEncoder.encode("pwd123")).thenReturn("enc");
        when(userRepository.save(any(User.class))).thenReturn(saved);

        User result = authService.registerUser(dto);
        assertSame(saved, result);

        ArgumentCaptor<User> cap = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(cap.capture());
        User toSave = cap.getValue();
        assertEquals("N", toSave.getName());
        assertEquals("S", toSave.getSurname());
        assertEquals("nick", toSave.getNickname());
        assertEquals("e@e.com", toSave.getEmail());
        assertEquals("enc", toSave.getPassword());
        assertNull(toSave.getImage());
    }

    @Test
    void registerUserWithImage() {
        RegisterDTO dto = new RegisterDTO();
        dto.setName("X"); dto.setSurname("Y");
        dto.setNickname("u"); dto.setEmail("u@u.com");
        dto.setPassword("p"); dto.setImageId(7L);
        Image img = new Image(); img.setId(7L);
        when(imageRepository.findById(7L)).thenReturn(Optional.of(img));
        when(passwordEncoder.encode("p")).thenReturn("encP");
        when(userRepository.save(any(User.class))).thenReturn(new User());

        authService.registerUser(dto);
        verify(imageRepository).findById(7L);
        ArgumentCaptor<User> cap = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(cap.capture());
        assertSame(img, cap.getValue().getImage());
    }

    @Test
    void registerUserImageNotFoundThrows() {
        RegisterDTO dto = new RegisterDTO();
        dto.setPassword("p"); dto.setImageId(9L);
        when(passwordEncoder.encode("p")).thenReturn("e");
        when(imageRepository.findById(9L)).thenReturn(Optional.empty());

        RuntimeException ex = assertThrows(RuntimeException.class,
            () -> authService.registerUser(dto));
        assertEquals("Imagen no encontrada", ex.getMessage());
    }

    @Test
    void getAuthenticatedUserSuccess() {
        // stubs from setUp
        User result = authService.getAuthenticatedUser(token);
        assertSame(user, result);
    }

    @Test
    void getAuthenticatedUserNotFoundThrows() {
        when(jwtUtil.extractEmail("abc.def.ghi")).thenReturn("no@one.com");
        when(userRepository.findByEmail("no@one.com")).thenReturn(Optional.empty());

        RuntimeException ex = assertThrows(RuntimeException.class,
            () -> authService.getAuthenticatedUser(token));
        assertEquals("Usuario no encontrado", ex.getMessage());
    }

    @Test
    void changePasswordSuccess() {
        ChangePasswordDTO dto = new ChangePasswordDTO();
        dto.setOldPassword("old"); dto.setNewPassword("new1"); dto.setConfirmNewPassword("new1");
        when(passwordEncoder.matches("old", "encodedPwd")).thenReturn(true);
        when(passwordEncoder.encode("new1")).thenReturn("encNew");
        when(userRepository.save(user)).thenReturn(user);

        Map<String,String> resp = authService.changePassword(token, dto);
        assertEquals("Contraseña cambiada correctamente", resp.get("message"));
        assertEquals("encNew", user.getPassword());
    }

    @Test
    void changePasswordBadOldThrows() {
        ChangePasswordDTO dto = new ChangePasswordDTO();
        dto.setOldPassword("no"); dto.setNewPassword("n"); dto.setConfirmNewPassword("n");
        when(passwordEncoder.matches("no", "encodedPwd")).thenReturn(false);

        RuntimeException ex = assertThrows(RuntimeException.class,
            () -> authService.changePassword(token, dto));
        assertEquals("La contraseña actual es incorrecta", ex.getMessage());
    }

    @Test
    void changePasswordMismatchThrows() {
        ChangePasswordDTO dto = new ChangePasswordDTO();
        dto.setOldPassword("old"); dto.setNewPassword("a"); dto.setConfirmNewPassword("b");
        when(passwordEncoder.matches("old", "encodedPwd")).thenReturn(true);

        RuntimeException ex = assertThrows(RuntimeException.class,
            () -> authService.changePassword(token, dto));
        assertEquals("La nueva contraseña y la confirmación no coinciden", ex.getMessage());
    }
}

