package com.noctis.ventas.controller;

import com.noctis.ventas.dto.ActualizarEstadoSolicitudDTO;
import com.noctis.ventas.dto.CrearSolicitudTecnicaDTO;
import com.noctis.ventas.dto.SolicitudTecnicaResponseDTO;
import com.noctis.ventas.service.SolicitudTecnicaService;
import com.noctis.ventas.util.TokenUtils;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping({"/api/solicitudes", "/api/ventas/solicitudes"})
public class SolicitudTecnicaController {

    private final SolicitudTecnicaService service;

    public SolicitudTecnicaController(SolicitudTecnicaService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<SolicitudTecnicaResponseDTO> crear(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @Valid @RequestBody CrearSolicitudTecnicaDTO dto) {
        TokenUtils.TokenClaims claims = TokenUtils.validateAndExtract(authHeader);
        SolicitudTecnicaResponseDTO response = service.crearSolicitud(dto, claims);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<List<SolicitudTecnicaResponseDTO>> listarTodas(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        TokenUtils.TokenClaims claims = TokenUtils.validateAndExtract(authHeader);
        return ResponseEntity.ok(service.listarTodas(claims));
    }

    @GetMapping("/cliente/{clienteId}")
    public ResponseEntity<List<SolicitudTecnicaResponseDTO>> listarPorCliente(
            @PathVariable Long clienteId,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        TokenUtils.TokenClaims claims = TokenUtils.validateAndExtract(authHeader);
        return ResponseEntity.ok(service.listarPorCliente(clienteId, claims));
    }

    @GetMapping("/{id}")
    public ResponseEntity<SolicitudTecnicaResponseDTO> obtenerPorId(
            @PathVariable Long id,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        TokenUtils.TokenClaims claims = TokenUtils.validateAndExtract(authHeader);
        return ResponseEntity.ok(service.obtenerPorId(id, claims));
    }

    @PutMapping("/{id}/estado")
    public ResponseEntity<SolicitudTecnicaResponseDTO> actualizarEstado(
            @PathVariable Long id,
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @Valid @RequestBody ActualizarEstadoSolicitudDTO dto) {
        TokenUtils.TokenClaims claims = TokenUtils.validateAndExtract(authHeader);
        return ResponseEntity.ok(service.actualizarEstado(id, dto, claims));
    }
}
