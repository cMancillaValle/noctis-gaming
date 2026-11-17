package com.noctis.clientes.service;

import com.noctis.clientes.dto.*;
import com.noctis.clientes.exception.BadRequestException;
import com.noctis.clientes.exception.ResourceNotFoundException;
import com.noctis.clientes.model.Cliente;
import com.noctis.clientes.repository.ClienteRepository;
import com.noctis.clientes.util.SecurityUtils;
import com.noctis.clientes.util.TokenUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ClienteService {

    private static final Logger log = LoggerFactory.getLogger(ClienteService.class);
    private final ClienteRepository clienteRepository;

    public ClienteService(ClienteRepository clienteRepository) {
        this.clienteRepository = clienteRepository;
    }

    @Transactional
    public ClienteResponseDTO registrar(ClienteRequestDTO dto) {
        if (clienteRepository.existsByEmail(dto.email())) {
            throw new BadRequestException("Ya existe un cliente registrado con el correo: " + dto.email());
        }

        if (dto.password() == null || dto.password().trim().length() < 6) {
            throw new BadRequestException("La contraseña es obligatoria y debe tener al menos 6 caracteres");
        }

        String passwordHash = SecurityUtils.hashPassword(dto.password());

        Cliente cliente = new Cliente();
        cliente.setNombre(dto.nombre().trim());
        cliente.setEmail(dto.email().trim().toLowerCase());
        cliente.setTelefono(dto.telefono().trim());
        cliente.setDireccion(dto.direccion().trim());
        cliente.setPasswordHash(passwordHash);
        cliente.setRol("CLIENTE");

        Cliente guardado = clienteRepository.save(cliente);
        log.info("Cliente registrado con éxito: ID {}, email {}", guardado.getId(), guardado.getEmail());
        return mapToDTO(guardado);
    }

    @Transactional
    public LoginResponseDTO autenticar(ClienteLoginDTO loginDTO) {
        Cliente cliente = clienteRepository.findByEmail(loginDTO.email().trim().toLowerCase())
                .orElseThrow(() -> new BadRequestException("Credenciales inválidas"));

        if (!SecurityUtils.verifyPassword(loginDTO.password(), cliente.getPasswordHash())) {
            throw new BadRequestException("Credenciales inválidas");
        }

        // Migración automática a BCrypt si tenía hash legacy
        if (SecurityUtils.isLegacyHash(cliente.getPasswordHash())) {
            log.info("Migrando hash legacy a BCrypt para el usuario: {}", cliente.getEmail());
            cliente.setPasswordHash(SecurityUtils.hashPassword(loginDTO.password()));
            clienteRepository.save(cliente);
        }

        String token = TokenUtils.generateToken(
                cliente.getId(),
                cliente.getEmail(),
                cliente.getNombre(),
                cliente.getRol() != null ? cliente.getRol() : "CLIENTE"
        );

        return new LoginResponseDTO(token, mapToDTO(cliente));
    }

    @Transactional
    public ClienteResponseDTO actualizarPerfil(Long id, ClienteUpdateDTO dto, String authHeader) {
        TokenUtils.TokenClaims caller = TokenUtils.validateAndExtract(authHeader);
        if (caller == null) {
            throw new BadRequestException("Sesión no autorizada o token inválido");
        }

        // Solo el propio usuario o un Administrador pueden actualizar estos datos
        boolean esElMismoUsuario = caller.id().equals(id);
        boolean esAdmin = "ADMIN".equalsIgnoreCase(caller.rol());

        if (!esElMismoUsuario && !esAdmin) {
            throw new BadRequestException("No tienes permisos para modificar este perfil de usuario");
        }

        Cliente cliente = clienteRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Cliente no encontrado con id: " + id));

        if (dto.nombre() != null && !dto.nombre().isBlank()) {
            cliente.setNombre(dto.nombre().trim());
        }
        if (dto.telefono() != null && !dto.telefono().isBlank()) {
            cliente.setTelefono(dto.telefono().trim());
        }
        if (dto.direccion() != null && !dto.direccion().isBlank()) {
            cliente.setDireccion(dto.direccion().trim());
        }

        // Si desea actualizar contraseña
        if (dto.passwordNueva() != null && !dto.passwordNueva().isBlank()) {
            if (dto.passwordNueva().trim().length() < 6) {
                throw new BadRequestException("La nueva contraseña debe tener al menos 6 caracteres");
            }

            // Si es el propio usuario, debe verificar la contraseña actual
            if (!esAdmin) {
                if (dto.passwordActual() == null || dto.passwordActual().isBlank()) {
                    throw new BadRequestException("Debes proporcionar tu contraseña actual para cambiarla");
                }
                if (!SecurityUtils.verifyPassword(dto.passwordActual(), cliente.getPasswordHash())) {
                    throw new BadRequestException("La contraseña actual es incorrecta");
                }
            }

            cliente.setPasswordHash(SecurityUtils.hashPassword(dto.passwordNueva()));
            log.info("Contraseña actualizada con éxito para el usuario ID: {}", cliente.getId());
        }

        Cliente actualizado = clienteRepository.save(cliente);
        return mapToDTO(actualizado);
    }

    @Transactional(readOnly = true)
    public List<ClienteResponseDTO> listarTodos() {
        return clienteRepository.findAll().stream()
                .map(this::mapToDTO)
                .toList();
    }

    @Transactional(readOnly = true)
    public ClienteResponseDTO buscarPorId(Long id) {
        Cliente cliente = clienteRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Cliente no encontrado con id: " + id));
        return mapToDTO(cliente);
    }

    @Transactional(readOnly = true)
    public ClienteResponseDTO buscarPorEmail(String email) {
        Cliente cliente = clienteRepository.findByEmail(email.trim().toLowerCase())
                .orElseThrow(() -> new ResourceNotFoundException("Cliente no encontrado con correo: " + email));
        return mapToDTO(cliente);
    }

    @Transactional(readOnly = true)
    public ClienteResponseDTO obtenerPerfilActual(String authHeader) {
        TokenUtils.TokenClaims caller = TokenUtils.validateAndExtract(authHeader);
        if (caller == null) {
            throw new BadRequestException("Sesión no autorizada o token inválido");
        }
        return buscarPorId(caller.id());
    }

    public ClienteResponseDTO mapToDTO(Cliente cliente) {
        return new ClienteResponseDTO(
                cliente.getId(),
                cliente.getNombre(),
                cliente.getEmail(),
                cliente.getTelefono(),
                cliente.getDireccion(),
                cliente.getRol() != null ? cliente.getRol() : "CLIENTE",
                cliente.getFechaRegistro()
        );
    }
}
