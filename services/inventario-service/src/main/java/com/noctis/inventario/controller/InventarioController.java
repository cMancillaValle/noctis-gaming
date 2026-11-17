package com.noctis.inventario.controller;

import com.noctis.inventario.dto.*;
import com.noctis.inventario.exception.BadRequestException;
import com.noctis.inventario.service.InventarioService;
import com.noctis.inventario.util.TokenUtils;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/inventario")
public class InventarioController {

    private final InventarioService inventarioService;

    @Value("${admin.api-key:}")
    private String configuredAdminKey;

    public InventarioController(InventarioService inventarioService) {
        this.inventarioService = inventarioService;
    }

    @GetMapping
    public ResponseEntity<List<InventarioResponseDTO>> listarTodo() {
        return ResponseEntity.ok(inventarioService.listarTodo());
    }

    @GetMapping("/producto/{productoId}")
    public ResponseEntity<InventarioResponseDTO> consultarPorProductoId(@PathVariable Long productoId) {
        return ResponseEntity.ok(inventarioService.consultarPorProductoId(productoId));
    }

    @PostMapping("/descontar")
    public ResponseEntity<ResultadoOperacionStockDTO> descontarStock(@Valid @RequestBody DescontarStockRequestDTO request) {
        return ResponseEntity.ok(inventarioService.descontarStock(request));
    }

    @PostMapping("/reponer")
    public ResponseEntity<ResultadoOperacionStockDTO> reponerStock(@Valid @RequestBody ReponerStockRequestDTO request) {
        return ResponseEntity.ok(inventarioService.reponerStock(request));
    }

    @PutMapping("/producto/{productoId}")
    public ResponseEntity<InventarioResponseDTO> actualizarStock(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestHeader(value = "X-Admin-Key", required = false) String adminKey,
            @PathVariable Long productoId,
            @Valid @RequestBody ActualizarStockDTO dto) {
        validarAccesoAdmin(authHeader, adminKey);
        return ResponseEntity.ok(inventarioService.actualizarStock(productoId, dto));
    }

    private void validarAccesoAdmin(String authHeader, String adminKey) {
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            TokenUtils.TokenClaims claims = TokenUtils.validateAndExtract(authHeader);
            if (claims != null && "ADMIN".equalsIgnoreCase(claims.rol())) {
                return;
            }
        }

        // 2. Acceso por API Key para integraciones internas autorizadas (si está configurada)
        if (configuredAdminKey != null && !configuredAdminKey.isBlank() && configuredAdminKey.equals(adminKey)) {
            return;
        }

        throw new BadRequestException("Acceso no autorizado: credenciales administrativas requeridas o inválidas");
    }
}
