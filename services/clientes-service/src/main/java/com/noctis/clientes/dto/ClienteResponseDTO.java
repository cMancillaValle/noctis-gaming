package com.noctis.clientes.dto;

import java.time.LocalDateTime;

public record ClienteResponseDTO(
        Long id,
        String nombre,
        String email,
        String telefono,
        String direccion,
        String rol,
        LocalDateTime fechaRegistro
) {}
