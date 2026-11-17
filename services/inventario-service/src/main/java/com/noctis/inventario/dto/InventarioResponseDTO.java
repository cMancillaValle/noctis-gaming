package com.noctis.inventario.dto;

import java.time.LocalDateTime;

public record InventarioResponseDTO(
        Long id,
        Long productoId,
        Integer cantidadDisponible,
        Integer cantidadReservada,
        String ubicacionAlmacen,
        LocalDateTime ultimaActualizacion
) {}
