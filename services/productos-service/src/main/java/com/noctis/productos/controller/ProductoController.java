package com.noctis.productos.controller;

import com.noctis.productos.dto.ActualizarPrecioDTO;
import com.noctis.productos.dto.ProductoRequestDTO;
import com.noctis.productos.dto.ProductoResponseDTO;
import com.noctis.productos.dto.ProductoUpdateDTO;
import com.noctis.productos.exception.BadRequestException;
import com.noctis.productos.service.ProductoService;
import com.noctis.productos.util.TokenUtils;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/productos")
public class ProductoController {

    private final ProductoService productoService;

    @Value("${admin.api-key:}")
    private String configuredAdminKey;

    public ProductoController(ProductoService productoService) {
        this.productoService = productoService;
    }

    @GetMapping
    public ResponseEntity<List<ProductoResponseDTO>> listar(
            @RequestParam(required = false) String categoria,
            @RequestParam(required = false) String busqueda) {
        return ResponseEntity.ok(productoService.listarProductos(categoria, busqueda));
    }

    @GetMapping("/admin")
    public ResponseEntity<List<ProductoResponseDTO>> listarTodosAdmin(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestHeader(value = "X-Admin-Key", required = false) String adminKey) {
        validarAccesoAdmin(authHeader, adminKey);
        return ResponseEntity.ok(productoService.listarTodosAdmin());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductoResponseDTO> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(productoService.buscarPorId(id));
    }

    @GetMapping("/categorias")
    public ResponseEntity<List<String>> listarCategorias() {
        return ResponseEntity.ok(productoService.obtenerCategorias());
    }

    @PostMapping
    public ResponseEntity<ProductoResponseDTO> crear(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestHeader(value = "X-Admin-Key", required = false) String adminKey,
            @Valid @RequestBody ProductoRequestDTO requestDTO) {
        validarAccesoAdmin(authHeader, adminKey);
        ProductoResponseDTO nuevo = productoService.crearProducto(requestDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(nuevo);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProductoResponseDTO> actualizarCompleto(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestHeader(value = "X-Admin-Key", required = false) String adminKey,
            @PathVariable Long id,
            @Valid @RequestBody ProductoUpdateDTO updateDTO) {
        validarAccesoAdmin(authHeader, adminKey);
        return ResponseEntity.ok(productoService.actualizarProductoCompleto(id, updateDTO));
    }

    @PutMapping("/{id}/precio")
    public ResponseEntity<ProductoResponseDTO> actualizarPrecio(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestHeader(value = "X-Admin-Key", required = false) String adminKey,
            @PathVariable Long id,
            @Valid @RequestBody ActualizarPrecioDTO dto) {
        validarAccesoAdmin(authHeader, adminKey);
        return ResponseEntity.ok(productoService.actualizarPrecio(id, dto));
    }

    private void validarAccesoAdmin(String authHeader, String adminKey) {
        // 1. Validar Token de Sesión Real de Usuario con Rol ADMIN
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            TokenUtils.TokenClaims claims = TokenUtils.validateAndExtract(authHeader);
            if (claims != null && "ADMIN".equalsIgnoreCase(claims.rol())) {
                return; // Sesión de Administrador válida y autenticada
            }
        }

        // 2. Acceso por API Key para integraciones internas autorizadas (si está configurada)
        if (configuredAdminKey != null && !configuredAdminKey.isBlank() && configuredAdminKey.equals(adminKey)) {
            return;
        }

        throw new BadRequestException("Acceso no autorizado: se requieren credenciales de administrador válidas");
    }
}
