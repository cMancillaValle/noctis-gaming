package com.noctis.facturacion.dto;

import java.math.BigDecimal;

public record FacturaItemResponseDTO(
        Long id,
        Long productoId,
        String productoNombre,
        Integer cantidad,
        BigDecimal precioUnitario,
        BigDecimal subtotalItem
) {}
