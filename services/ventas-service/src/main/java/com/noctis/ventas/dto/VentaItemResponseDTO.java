package com.noctis.ventas.dto;

import java.math.BigDecimal;

public record VentaItemResponseDTO(
        Long id,
        Long productoId,
        String productoNombre,
        Integer cantidad,
        BigDecimal precioUnitario,
        BigDecimal subtotalItem
) {}
