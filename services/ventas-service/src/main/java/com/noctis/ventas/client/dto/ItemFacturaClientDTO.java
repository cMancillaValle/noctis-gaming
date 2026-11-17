package com.noctis.ventas.client.dto;

import java.math.BigDecimal;

public record ItemFacturaClientDTO(
        Long productoId,
        String productoNombre,
        Integer cantidad,
        BigDecimal precioUnitario
) {}
