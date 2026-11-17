package com.noctis.ventas.dto;

import com.noctis.ventas.model.EstadoConversacion;
import com.noctis.ventas.model.TipoOrigenConversacion;
import java.time.LocalDateTime;

public record ConversacionResponseDTO(
    Long id,
    TipoOrigenConversacion tipoOrigen,
    Long entidadId,
    Long clienteId,
    String tituloContexto,
    EstadoConversacion estado,
    LocalDateTime fechaCreacion,
    LocalDateTime fechaUltimaActividad,
    long unreadCount,
    String ultimoMensaje
) {}
