package com.noctis.inventario.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;

import java.util.List;

public record DescontarStockRequestDTO(
        @NotBlank(message = "El identificador de operación es obligatorio para idempotencia")
        String operacionId,

        @NotEmpty(message = "Debe enviar al menos un item para descontar")
        List<@Valid ItemDescuentoDTO> items,

        String referencia
) {}
