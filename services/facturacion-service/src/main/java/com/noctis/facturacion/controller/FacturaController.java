package com.noctis.facturacion.controller;

import com.noctis.facturacion.dto.FacturaResponseDTO;
import com.noctis.facturacion.dto.GenerarFacturaRequestDTO;
import com.noctis.facturacion.service.FacturaService;
import com.noctis.facturacion.util.AuthorizationUtils;
import com.noctis.facturacion.util.TokenUtils;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/facturas")
public class FacturaController {

    private final FacturaService facturaService;

    public FacturaController(FacturaService facturaService) {
        this.facturaService = facturaService;
    }

    @PostMapping
    public ResponseEntity<FacturaResponseDTO> generar(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @Valid @RequestBody GenerarFacturaRequestDTO request) {
        AuthorizationUtils.requireVentasService(authHeader);
        FacturaResponseDTO factura = facturaService.generarFactura(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(factura);
    }

    @GetMapping
    public ResponseEntity<List<FacturaResponseDTO>> listarTodas(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        AuthorizationUtils.requireAdmin(AuthorizationUtils.requireAuthenticated(authHeader));
        return ResponseEntity.ok(facturaService.listarTodas());
    }

    @GetMapping("/{id}")
    public ResponseEntity<FacturaResponseDTO> buscarPorId(
            @PathVariable Long id,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        TokenUtils.TokenClaims claims = AuthorizationUtils.requireAuthenticated(authHeader);
        FacturaResponseDTO factura = facturaService.buscarPorId(id);
        AuthorizationUtils.requireOwnerOrAdmin(claims, factura.clienteId());
        return ResponseEntity.ok(factura);
    }

    @GetMapping("/venta/{ventaId}")
    public ResponseEntity<FacturaResponseDTO> buscarPorVentaId(
            @PathVariable Long ventaId,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        TokenUtils.TokenClaims claims = AuthorizationUtils.requireAuthenticated(authHeader);
        FacturaResponseDTO factura = facturaService.buscarPorVentaId(ventaId);
        AuthorizationUtils.requireOwnerOrAdmin(claims, factura.clienteId());
        return ResponseEntity.ok(factura);
    }
}
