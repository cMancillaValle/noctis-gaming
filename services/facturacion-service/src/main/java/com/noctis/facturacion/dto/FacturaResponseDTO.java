package com.noctis.facturacion.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record FacturaResponseDTO(
        Long id,
        String numeroFactura,
        Long ventaId,
        LocalDateTime fechaEmision,
        Long clienteId,
        String clienteNombre,
        String clienteEmail,
        String clienteDireccion,
        BigDecimal subtotal,
        BigDecimal impuestos,
        BigDecimal total,
        String estado,
        List<FacturaItemResponseDTO> items
) {}
