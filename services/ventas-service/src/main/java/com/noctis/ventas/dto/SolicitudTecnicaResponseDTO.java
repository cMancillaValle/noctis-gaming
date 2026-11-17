package com.noctis.ventas.dto;

import com.noctis.ventas.model.EstadoSolicitud;
import java.time.LocalDateTime;

public record SolicitudTecnicaResponseDTO(
    Long id,
    String numeroSolicitud,
    Long clienteId,
    String clienteNombre,
    String clienteTelefono,
    String clienteEmail,
    String servicioTipo,
    String dispositivoTipo,
    String marcaModelo,
    String sintomas,
    String ciudad,
    EstadoSolicitud estado,
    LocalDateTime fechaCreacion,
    LocalDateTime fechaActualizacion
) {}
