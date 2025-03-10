package com.todus.user;

import javax.validation.constraints.Email;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;

public record UserProfileDTO(
    @NotBlank(message = "El nombre no puede estar vacío")
    String name,

    @NotBlank
    String surname,

    @NotBlank
    String nickname,
    
    @NotBlank(message = "El email no puede estar vacío")
    @Email(message = "El email debe tener un formato válido")
    String email,

    @NotNull(message = "La imagen no puede ser null")
    Long imageId,

    @NotBlank(message = "La URL de la imagen no puede estar vacía")
    String imageUrl
) {}

