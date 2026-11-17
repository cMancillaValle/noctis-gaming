package com.noctis.clientes.controller;

import com.noctis.clientes.dto.*;
import com.noctis.clientes.service.ClienteService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/clientes")
public class ClienteController {

    private final ClienteService clienteService;

    public ClienteController(ClienteService clienteService) {
        this.clienteService = clienteService;
    }

    @PostMapping
    public ResponseEntity<ClienteResponseDTO> registrar(@Valid @RequestBody ClienteRequestDTO requestDTO) {
        ClienteResponseDTO nuevoCliente = clienteService.registrar(requestDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(nuevoCliente);
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponseDTO> login(@Valid @RequestBody ClienteLoginDTO loginDTO) {
        return ResponseEntity.ok(clienteService.autenticar(loginDTO));
    }

    @GetMapping("/me")
    public ResponseEntity<ClienteResponseDTO> obtenerPerfilActual(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        return ResponseEntity.ok(clienteService.obtenerPerfilActual(authHeader));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ClienteResponseDTO> actualizarPerfil(
            @PathVariable Long id,
            @Valid @RequestBody ClienteUpdateDTO updateDTO,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        return ResponseEntity.ok(clienteService.actualizarPerfil(id, updateDTO, authHeader));
    }

    @GetMapping
    public ResponseEntity<List<ClienteResponseDTO>> listarTodos() {
        return ResponseEntity.ok(clienteService.listarTodos());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ClienteResponseDTO> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(clienteService.buscarPorId(id));
    }

    @GetMapping("/email/{email}")
    public ResponseEntity<ClienteResponseDTO> buscarPorEmail(@PathVariable String email) {
        return ResponseEntity.ok(clienteService.buscarPorEmail(email));
    }
}
