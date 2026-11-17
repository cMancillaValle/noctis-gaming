package com.noctis.ventas.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record VentaResponseDTO(
        Long id,
        String numeroVenta,
        String operacionId,
        Long clienteId,
        String direccionEntrega,
        BigDecimal total,
        String estado,
        String numeroFactura,
        LocalDateTime fechaCreacion,
        List<VentaItemResponseDTO> items
) {}
