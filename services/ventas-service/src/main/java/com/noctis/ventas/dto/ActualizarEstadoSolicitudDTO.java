package com.noctis.ventas.dto;

import com.noctis.ventas.model.EstadoSolicitud;
import jakarta.validation.constraints.NotNull;

public record ActualizarEstadoSolicitudDTO(
    @NotNull(message = "El estado es obligatorio")
    EstadoSolicitud estado
) {}
