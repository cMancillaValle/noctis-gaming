package com.noctis.clientes.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record ClienteLoginDTO(
        @NotBlank(message = "El email es requerido")
        @Email(message = "El formato de correo no es válido")
        String email,

        @NotBlank(message = "La contraseña es requerida")
        String password
) {}
