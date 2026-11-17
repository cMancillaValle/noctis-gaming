package com.noctis.inventario.dto;

import jakarta.validation.constraints.NotBlank;

public record ReponerStockRequestDTO(
        @NotBlank(message = "El identificador de operación original es obligatorio para compensación")
        String operacionId,

        String motivo
) {}
