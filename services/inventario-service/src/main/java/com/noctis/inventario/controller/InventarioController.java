package com.noctis.inventario.controller;

import com.noctis.inventario.dto.*;
import com.noctis.inventario.service.InventarioService;
import com.noctis.inventario.util.AuthorizationUtils;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/inventario")
public class InventarioController {

    private final InventarioService inventarioService;

    public InventarioController(InventarioService inventarioService) {
        this.inventarioService = inventarioService;
    }

    @GetMapping
    public ResponseEntity<List<InventarioResponseDTO>> listarTodo(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        AuthorizationUtils.requireAdmin(authHeader);
        return ResponseEntity.ok(inventarioService.listarTodo());
    }

    @GetMapping("/producto/{productoId}")
    public ResponseEntity<InventarioResponseDTO> consultarPorProductoId(
            @PathVariable Long productoId,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        AuthorizationUtils.requireAdmin(authHeader);
        return ResponseEntity.ok(inventarioService.consultarPorProductoId(productoId));
    }

    @PostMapping("/descontar")
    public ResponseEntity<ResultadoOperacionStockDTO> descontarStock(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @Valid @RequestBody DescontarStockRequestDTO request) {
        AuthorizationUtils.requireVentasService(authHeader);
        return ResponseEntity.ok(inventarioService.descontarStock(request));
    }

    @PostMapping("/reponer")
    public ResponseEntity<ResultadoOperacionStockDTO> reponerStock(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @Valid @RequestBody ReponerStockRequestDTO request) {
        AuthorizationUtils.requireVentasService(authHeader);
        return ResponseEntity.ok(inventarioService.reponerStock(request));
    }

    @PutMapping("/producto/{productoId}")
    public ResponseEntity<InventarioResponseDTO> actualizarStock(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @PathVariable Long productoId,
            @Valid @RequestBody ActualizarStockDTO dto) {
        AuthorizationUtils.requireAdmin(authHeader);
        return ResponseEntity.ok(inventarioService.actualizarStock(productoId, dto));
    }
}
