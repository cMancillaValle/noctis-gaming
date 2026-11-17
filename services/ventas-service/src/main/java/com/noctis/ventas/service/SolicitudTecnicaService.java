package com.noctis.ventas.service;

import com.noctis.ventas.dto.ActualizarEstadoSolicitudDTO;
import com.noctis.ventas.dto.CrearSolicitudTecnicaDTO;
import com.noctis.ventas.dto.SolicitudTecnicaResponseDTO;
import com.noctis.ventas.exception.BadRequestException;
import com.noctis.ventas.exception.ResourceNotFoundException;
import com.noctis.ventas.model.EstadoSolicitud;
import com.noctis.ventas.model.SolicitudTecnica;
import com.noctis.ventas.repository.SolicitudTecnicaRepository;
import com.noctis.ventas.util.TokenUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class SolicitudTecnicaService {

    private static final Logger log = LoggerFactory.getLogger(SolicitudTecnicaService.class);

    private final SolicitudTecnicaRepository repository;

    public SolicitudTecnicaService(SolicitudTecnicaRepository repository) {
        this.repository = repository;
    }

    @Transactional
    public SolicitudTecnicaResponseDTO crearSolicitud(CrearSolicitudTecnicaDTO dto, TokenUtils.TokenClaims claims) {
        if (claims == null) {
            throw new BadRequestException("Se requiere inicio de sesión para radicar una solicitud técnica oficial");
        }

        // Si no es admin, el clienteId debe corresponder al usuario autenticado
        if (!"ADMIN".equalsIgnoreCase(claims.rol()) && !claims.id().equals(dto.clienteId())) {
            throw new BadRequestException("No puedes crear solicitudes técnicas a nombre de otro cliente");
        }

        long count = repository.count() + 1;
        String numeroSolicitud = String.format("ST-2026-%05d", count);

        SolicitudTecnica solicitud = new SolicitudTecnica();
        solicitud.setNumeroSolicitud(numeroSolicitud);
        solicitud.setClienteId(claims.id());
        solicitud.setClienteNombre(dto.clienteNombre());
        solicitud.setClienteTelefono(dto.clienteTelefono());
        solicitud.setClienteEmail(dto.clienteEmail());
        solicitud.setServicioTipo(dto.servicioTipo());
        solicitud.setDispositivoTipo(dto.dispositivoTipo());
        solicitud.setMarcaModelo(dto.marcaModelo());
        solicitud.setSintomas(dto.sintomas());
        solicitud.setCiudad(dto.ciudad());
        solicitud.setEstado(EstadoSolicitud.RECIBIDA);
        solicitud.setFechaCreacion(LocalDateTime.now());
        solicitud.setFechaActualizacion(LocalDateTime.now());

        SolicitudTecnica guardada = repository.save(solicitud);
        log.info("Solicitud técnica {} radicada con éxito para cliente ID {}", numeroSolicitud, claims.id());

        return mapToDTO(guardada);
    }

    @Transactional(readOnly = true)
    public List<SolicitudTecnicaResponseDTO> listarTodas(TokenUtils.TokenClaims claims) {
        validarEsAdmin(claims);
        return repository.findAllByOrderByFechaCreacionDesc().stream()
                .map(this::mapToDTO)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<SolicitudTecnicaResponseDTO> listarPorCliente(Long clienteId, TokenUtils.TokenClaims claims) {
        if (claims == null) {
            throw new BadRequestException("Autenticación requerida");
        }
        if (!"ADMIN".equalsIgnoreCase(claims.rol()) && !claims.id().equals(clienteId)) {
            throw new BadRequestException("No tienes autorización para consultar las solicitudes de otro cliente");
        }
        return repository.findByClienteIdOrderByFechaCreacionDesc(clienteId).stream()
                .map(this::mapToDTO)
                .toList();
    }

    @Transactional(readOnly = true)
    public SolicitudTecnicaResponseDTO obtenerPorId(Long id, TokenUtils.TokenClaims claims) {
        if (claims == null) {
            throw new BadRequestException("Autenticación requerida");
        }
        SolicitudTecnica solicitud = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Solicitud técnica no encontrada con ID: " + id));

        if (!"ADMIN".equalsIgnoreCase(claims.rol()) && !claims.id().equals(solicitud.getClienteId())) {
            throw new BadRequestException("No tienes autorización para acceder a esta solicitud técnica");
        }
        return mapToDTO(solicitud);
    }

    @Transactional
    public SolicitudTecnicaResponseDTO actualizarEstado(Long id, ActualizarEstadoSolicitudDTO dto, TokenUtils.TokenClaims claims) {
        validarEsAdmin(claims);

        SolicitudTecnica solicitud = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Solicitud técnica no encontrada con ID: " + id));

        solicitud.setEstado(dto.estado());
        solicitud.setFechaActualizacion(LocalDateTime.now());

        SolicitudTecnica actualizada = repository.save(solicitud);
        log.info("Estado de solicitud técnica {} actualizado a {}", solicitud.getNumeroSolicitud(), dto.estado());

        return mapToDTO(actualizada);
    }

    private void validarEsAdmin(TokenUtils.TokenClaims claims) {
        if (claims == null || !"ADMIN".equalsIgnoreCase(claims.rol())) {
            throw new BadRequestException("Acceso restringido: requiere privilegios de administrador");
        }
    }

    private SolicitudTecnicaResponseDTO mapToDTO(SolicitudTecnica s) {
        return new SolicitudTecnicaResponseDTO(
                s.getId(),
                s.getNumeroSolicitud(),
                s.getClienteId(),
                s.getClienteNombre(),
                s.getClienteTelefono(),
                s.getClienteEmail(),
                s.getServicioTipo(),
                s.getDispositivoTipo(),
                s.getMarcaModelo(),
                s.getSintomas(),
                s.getCiudad(),
                s.getEstado(),
                s.getFechaCreacion(),
                s.getFechaActualizacion()
        );
    }
}
