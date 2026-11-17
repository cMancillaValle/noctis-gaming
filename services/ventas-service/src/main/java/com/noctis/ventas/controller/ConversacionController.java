package com.noctis.ventas.controller;

import com.noctis.ventas.dto.ConversacionResponseDTO;
import com.noctis.ventas.dto.CrearMensajeDTO;
import com.noctis.ventas.dto.MensajeResponseDTO;
import com.noctis.ventas.model.TipoOrigenConversacion;
import com.noctis.ventas.service.ConversacionService;
import com.noctis.ventas.util.TokenUtils;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping({"/api/conversaciones", "/api/ventas/conversaciones"})
public class ConversacionController {

    private final ConversacionService service;

    public ConversacionController(ConversacionService service) {
        this.service = service;
    }

    @GetMapping("/contexto")
    public ResponseEntity<ConversacionResponseDTO> obtenerOInicializarPorContexto(
            @RequestParam("tipoOrigen") TipoOrigenConversacion tipoOrigen,
            @RequestParam("entidadId") Long entidadId,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        TokenUtils.TokenClaims claims = TokenUtils.validateAndExtract(authHeader);
        return ResponseEntity.ok(service.obtenerOInicializarPorContexto(tipoOrigen, entidadId, claims));
    }

    @GetMapping
    public ResponseEntity<List<ConversacionResponseDTO>> listar(
            @RequestParam(value = "tipoOrigen", required = false) TipoOrigenConversacion tipoOrigen,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        TokenUtils.TokenClaims claims = TokenUtils.validateAndExtract(authHeader);
        return ResponseEntity.ok(service.listarConversaciones(tipoOrigen, claims));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ConversacionResponseDTO> obtenerPorId(
            @PathVariable Long id,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        TokenUtils.TokenClaims claims = TokenUtils.validateAndExtract(authHeader);
        return ResponseEntity.ok(service.obtenerPorId(id, claims));
    }

    @GetMapping("/{id}/mensajes")
    public ResponseEntity<List<MensajeResponseDTO>> listarMensajes(
            @PathVariable Long id,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        TokenUtils.TokenClaims claims = TokenUtils.validateAndExtract(authHeader);
        return ResponseEntity.ok(service.listarMensajes(id, claims));
    }

    @PostMapping("/{id}/mensajes")
    public ResponseEntity<MensajeResponseDTO> enviarMensaje(
            @PathVariable Long id,
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @Valid @RequestBody CrearMensajeDTO dto) {
        TokenUtils.TokenClaims claims = TokenUtils.validateAndExtract(authHeader);
        MensajeResponseDTO response = service.enviarMensaje(id, dto, claims);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{id}/cerrar")
    public ResponseEntity<ConversacionResponseDTO> cerrar(
            @PathVariable Long id,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        TokenUtils.TokenClaims claims = TokenUtils.validateAndExtract(authHeader);
        return ResponseEntity.ok(service.cerrarConversacion(id, claims));
    }
}
