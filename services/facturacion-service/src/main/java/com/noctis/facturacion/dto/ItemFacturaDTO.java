package com.noctis.facturacion.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record ItemFacturaDTO(
        @NotNull(message = "El ID del producto es obligatorio")
        Long productoId,

        @NotBlank(message = "El nombre del producto es obligatorio")
        String productoNombre,

        @NotNull(message = "La cantidad es obligatoria")
        @Min(value = 1, message = "La cantidad mínima es 1")
        Integer cantidad,

        @NotNull(message = "El precio unitario es obligatorio")
        @DecimalMin(value = "0.01", message = "El precio unitario debe ser mayor a 0")
        BigDecimal precioUnitario
) {}
