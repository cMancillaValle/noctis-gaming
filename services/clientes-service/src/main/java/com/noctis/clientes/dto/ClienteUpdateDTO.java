package com.noctis.clientes.dto;

import jakarta.validation.constraints.Size;

public record ClienteUpdateDTO(
        @Size(min = 2, max = 120, message = "El nombre debe tener entre 2 y 120 caracteres")
        String nombre,

        @Size(min = 7, max = 30, message = "El teléfono debe tener entre 7 y 30 caracteres")
        String telefono,

        @Size(min = 5, max = 250, message = "La dirección debe tener entre 5 y 250 caracteres")
        String direccion,

        String passwordActual,

        @Size(min = 6, max = 100, message = "La nueva contraseña debe tener al menos 6 caracteres")
        String passwordNueva
) {}
