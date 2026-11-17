package com.noctis.ventas.client.dto;

public record ResultadoOperacionStockClientDTO(
        String operacionId,
        boolean exitoso,
        String mensaje,
        int itemsAfectados
) {}
