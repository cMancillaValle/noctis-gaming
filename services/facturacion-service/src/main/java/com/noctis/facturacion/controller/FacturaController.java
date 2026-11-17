package com.noctis.facturacion.controller;

import com.noctis.facturacion.dto.FacturaResponseDTO;
import com.noctis.facturacion.dto.GenerarFacturaRequestDTO;
import com.noctis.facturacion.service.FacturaService;
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
    public ResponseEntity<FacturaResponseDTO> generar(@Valid @RequestBody GenerarFacturaRequestDTO request) {
        FacturaResponseDTO factura = facturaService.generarFactura(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(factura);
    }

    @GetMapping
    public ResponseEntity<List<FacturaResponseDTO>> listarTodas() {
        return ResponseEntity.ok(facturaService.listarTodas());
    }

    @GetMapping("/{id}")
    public ResponseEntity<FacturaResponseDTO> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(facturaService.buscarPorId(id));
    }

    @GetMapping("/venta/{ventaId}")
    public ResponseEntity<FacturaResponseDTO> buscarPorVentaId(@PathVariable Long ventaId) {
        return ResponseEntity.ok(facturaService.buscarPorVentaId(ventaId));
    }
}
