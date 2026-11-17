package com.noctis.ventas.dto;

import java.time.LocalDateTime;

public record MensajeResponseDTO(
    Long id,
    Long conversacionId,
    Long remitenteId,
    String remitenteRol,
    String remitenteNombre,
    String contenido,
    LocalDateTime fechaHora,
    Boolean leidoPorAdmin,
    Boolean leidoPorCliente
) {}
