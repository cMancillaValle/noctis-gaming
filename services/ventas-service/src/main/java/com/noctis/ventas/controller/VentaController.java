package com.noctis.ventas.controller;

import com.noctis.ventas.dto.CrearVentaRequestDTO;
import com.noctis.ventas.dto.VentaResponseDTO;
import com.noctis.ventas.service.VentaService;
import com.noctis.ventas.util.AuthorizationUtils;
import com.noctis.ventas.util.TokenUtils;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ventas")
public class VentaController {

    private final VentaService ventaService;

    public VentaController(VentaService ventaService) {
        this.ventaService = ventaService;
    }

    @PostMapping
    public ResponseEntity<VentaResponseDTO> crearVenta(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @Valid @RequestBody CrearVentaRequestDTO request) {
        TokenUtils.TokenClaims claims = AuthorizationUtils.requireAuthenticated(authHeader);
        AuthorizationUtils.requireOwnerOrAdmin(claims, request.clienteId());
        VentaResponseDTO venta = ventaService.procesarVenta(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(venta);
    }

    @GetMapping
    public ResponseEntity<List<VentaResponseDTO>> listarTodas(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        AuthorizationUtils.requireAdmin(AuthorizationUtils.requireAuthenticated(authHeader));
        return ResponseEntity.ok(ventaService.listarTodas());
    }

    @GetMapping("/{id}")
    public ResponseEntity<VentaResponseDTO> buscarPorId(
            @PathVariable Long id,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        TokenUtils.TokenClaims claims = AuthorizationUtils.requireAuthenticated(authHeader);
        VentaResponseDTO venta = ventaService.buscarPorId(id);
        AuthorizationUtils.requireOwnerOrAdmin(claims, venta.clienteId());
        return ResponseEntity.ok(venta);
    }

    @GetMapping("/cliente/{clienteId}")
    public ResponseEntity<List<VentaResponseDTO>> buscarPorCliente(
            @PathVariable Long clienteId,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        AuthorizationUtils.requireOwnerOrAdmin(AuthorizationUtils.requireAuthenticated(authHeader), clienteId);
        return ResponseEntity.ok(ventaService.buscarPorCliente(clienteId));
    }
}
