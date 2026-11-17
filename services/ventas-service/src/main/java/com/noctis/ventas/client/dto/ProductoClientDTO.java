package com.noctis.ventas.client.dto;

import java.math.BigDecimal;

public record ProductoClientDTO(
        Long id,
        String nombre,
        String descripcion,
        BigDecimal precio,
        String categoria,
        String imagenUrl,
        boolean activo
) {}
