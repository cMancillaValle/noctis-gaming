package com.noctis.facturacion.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.util.List;

public record GenerarFacturaRequestDTO(
        @NotNull(message = "El ID de la venta es obligatorio")
        Long ventaId,

        @NotNull(message = "El ID del cliente es obligatorio")
        Long clienteId,

        @NotBlank(message = "El nombre del cliente es obligatorio")
        String clienteNombre,

        @NotBlank(message = "El email del cliente es obligatorio")
        String clienteEmail,

        @NotBlank(message = "La dirección del cliente es obligatoria")
        String clienteDireccion,

        @NotEmpty(message = "Debe incluir los items de la venta")
        List<@Valid ItemFacturaDTO> items,

        @NotNull(message = "El total de la venta es obligatorio")
        @DecimalMin(value = "0.01", message = "El total debe ser positivo")
        BigDecimal total
) {}
