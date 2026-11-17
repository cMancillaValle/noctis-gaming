package com.noctis.ventas.client.dto;

import java.math.BigDecimal;
import java.util.List;

public record GenerarFacturaClientRequestDTO(
        Long ventaId,
        Long clienteId,
        String clienteNombre,
        String clienteEmail,
        String clienteDireccion,
        List<ItemFacturaClientDTO> items,
        BigDecimal total
) {}
