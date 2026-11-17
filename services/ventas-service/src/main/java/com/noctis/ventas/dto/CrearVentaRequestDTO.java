package com.noctis.ventas.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.List;

public record CrearVentaRequestDTO(
        @NotNull(message = "El ID del cliente es obligatorio")
        Long clienteId,

        @NotBlank(message = "La dirección de entrega es obligatoria")
        @Size(min = 5, max = 250, message = "La dirección debe tener entre 5 y 250 caracteres")
        String direccionEntrega,

        @NotEmpty(message = "Debe incluir al menos un producto para realizar la compra")
        List<@Valid ItemVentaRequestDTO> items
) {}
