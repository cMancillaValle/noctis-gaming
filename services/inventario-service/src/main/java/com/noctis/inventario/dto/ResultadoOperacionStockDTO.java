package com.noctis.inventario.dto;

public record ResultadoOperacionStockDTO(
        String operacionId,
        boolean exitoso,
        String mensaje,
        int itemsAfectados
) {}
