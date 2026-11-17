package com.noctis.ventas.client.dto;

import java.util.List;

public record DescontarStockClientRequestDTO(
        String operacionId,
        List<ItemDescuentoClientDTO> items,
        String referencia
) {}
