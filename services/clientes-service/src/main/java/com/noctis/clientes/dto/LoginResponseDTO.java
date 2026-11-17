package com.noctis.clientes.dto;

public record LoginResponseDTO(
        String token,
        ClienteResponseDTO cliente
) {}
