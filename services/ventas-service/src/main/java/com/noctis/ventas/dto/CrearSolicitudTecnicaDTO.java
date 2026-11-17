package com.noctis.ventas.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CrearSolicitudTecnicaDTO(
    @NotNull(message = "El clienteId es obligatorio")
    Long clienteId,

    @NotBlank(message = "El nombre del cliente es obligatorio")
    String clienteNombre,

    @NotBlank(message = "El teléfono del cliente es obligatorio")
    String clienteTelefono,

    @NotBlank(message = "El correo electrónico es obligatorio")
    String clienteEmail,

    @NotBlank(message = "El tipo de servicio es obligatorio")
    String servicioTipo,

    @NotBlank(message = "El tipo de dispositivo es obligatorio")
    String dispositivoTipo,

    @NotBlank(message = "La marca y modelo son obligatorios")
    String marcaModelo,

    @NotBlank(message = "La descripción de síntomas es obligatoria")
    String sintomas,

    @NotBlank(message = "La ciudad es obligatoria")
    String ciudad
) {}
