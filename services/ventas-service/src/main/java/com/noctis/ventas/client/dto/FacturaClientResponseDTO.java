package com.noctis.ventas.client.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record FacturaClientResponseDTO(
        Long id,
        String numeroFactura,
        Long ventaId,
        LocalDateTime fechaEmision,
        BigDecimal total,
        String estado
) {}
