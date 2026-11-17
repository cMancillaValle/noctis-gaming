package com.noctis.ventas.client.dto;

public record ClienteClientDTO(
        Long id,
        String nombre,
        String email,
        String telefono,
        String direccion
) {}
