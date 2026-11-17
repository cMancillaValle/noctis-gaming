package com.noctis.ventas.service;

import com.noctis.ventas.dto.ConversacionResponseDTO;
import com.noctis.ventas.dto.CrearMensajeDTO;
import com.noctis.ventas.dto.MensajeResponseDTO;
import com.noctis.ventas.exception.BadRequestException;
import com.noctis.ventas.exception.ResourceNotFoundException;
import com.noctis.ventas.model.*;
import com.noctis.ventas.repository.ConversacionRepository;
import com.noctis.ventas.repository.MensajeRepository;
import com.noctis.ventas.repository.SolicitudTecnicaRepository;
import com.noctis.ventas.repository.VentaRepository;
import com.noctis.ventas.util.TokenUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ConversacionService {

    private static final Logger log = LoggerFactory.getLogger(ConversacionService.class);

    private final ConversacionRepository conversacionRepository;
    private final MensajeRepository mensajeRepository;
    private final VentaRepository ventaRepository;
    private final SolicitudTecnicaRepository solicitudRepository;

    public ConversacionService(ConversacionRepository conversacionRepository,
                               MensajeRepository mensajeRepository,
                               VentaRepository ventaRepository,
                               SolicitudTecnicaRepository solicitudRepository) {
        this.conversacionRepository = conversacionRepository;
        this.mensajeRepository = mensajeRepository;
        this.ventaRepository = ventaRepository;
        this.solicitudRepository = solicitudRepository;
    }

    /**
     * Obtiene la conversación asociada a un pedido o solicitud técnica existente,
     * o la inicializa si es la primera vez que se accede a su hilo.
     */
    @Transactional
    public ConversacionResponseDTO obtenerOInicializarPorContexto(TipoOrigenConversacion tipoOrigen, Long entidadId, TokenUtils.TokenClaims claims) {
        if (claims == null) {
            throw new BadRequestException("Autenticación requerida para acceder al canal de mensajes");
        }

        Long clientePropietarioId;
        String tituloContexto;

        if (tipoOrigen == TipoOrigenConversacion.PEDIDO) {
            Venta venta = ventaRepository.findById(entidadId)
                    .orElseThrow(() -> new ResourceNotFoundException("No existe ninguna compra/pedido con ID: " + entidadId));
            clientePropietarioId = venta.getClienteId();
            tituloContexto = "Pedido " + venta.getNumeroVenta();
        } else if (tipoOrigen == TipoOrigenConversacion.SOLICITUD_TECNICA) {
            SolicitudTecnica solicitud = solicitudRepository.findById(entidadId)
                    .orElseThrow(() -> new ResourceNotFoundException("No existe ninguna solicitud técnica con ID: " + entidadId));
            clientePropietarioId = solicitud.getClienteId();
            tituloContexto = "Solicitud " + solicitud.getNumeroSolicitud() + " (" + solicitud.getDispositivoTipo() + ")";
        } else {
            throw new BadRequestException("Tipo de origen inválido. Solo se admiten PEDIDO o SOLICITUD_TECNICA.");
        }

        // Validación de pertenencia
        boolean esAdmin = "ADMIN".equalsIgnoreCase(claims.rol());
        if (!esAdmin && !claims.id().equals(clientePropietarioId)) {
            throw new BadRequestException("Acceso denegado: este hilo de mensajes pertenece a otro usuario");
        }

        Conversacion conversacion = conversacionRepository.findByTipoOrigenAndEntidadId(tipoOrigen, entidadId)
                .orElseGet(() -> {
                    Conversacion nueva = new Conversacion();
                    nueva.setTipoOrigen(tipoOrigen);
                    nueva.setEntidadId(entidadId);
                    nueva.setClienteId(clientePropietarioId);
                    nueva.setTituloContexto(tituloContexto);
                    nueva.setEstado(EstadoConversacion.ABIERTA);
                    nueva.setFechaCreacion(LocalDateTime.now());
                    nueva.setFechaUltimaActividad(LocalDateTime.now());
                    Conversacion guardada = conversacionRepository.save(nueva);

                    // Mensaje de apertura del sistema
                    Mensaje bienvenida = new Mensaje();
                    bienvenida.setConversacionId(guardada.getId());
                    bienvenida.setRemitenteId(0L);
                    bienvenida.setRemitenteRol("SISTEMA");
                    bienvenida.setRemitenteNombre("Noctis Gaming Soporte");
                    bienvenida.setContenido("Canal oficial de atención abierto para " + tituloContexto + ". Nuestro equipo revisará tus mensajes.");
                    bienvenida.setFechaHora(LocalDateTime.now());
                    bienvenida.setLeidoPorAdmin(true);
                    bienvenida.setLeidoPorCliente(true);
                    mensajeRepository.save(bienvenida);

                    return guardada;
                });

        return mapConversacionDTO(conversacion, claims);
    }

    @Transactional(readOnly = true)
    public List<ConversacionResponseDTO> listarConversaciones(TipoOrigenConversacion filtroTipo, TokenUtils.TokenClaims claims) {
        if (claims == null) {
            throw new BadRequestException("Autenticación requerida");
        }

        boolean esAdmin = "ADMIN".equalsIgnoreCase(claims.rol());
        List<Conversacion> lista;

        if (esAdmin) {
            if (filtroTipo != null) {
                lista = conversacionRepository.findByTipoOrigenOrderByFechaUltimaActividadDesc(filtroTipo);
            } else {
                lista = conversacionRepository.findAllByOrderByFechaUltimaActividadDesc();
            }
        } else {
            lista = conversacionRepository.findByClienteIdOrderByFechaUltimaActividadDesc(claims.id());
            if (filtroTipo != null) {
                lista = lista.stream().filter(c -> c.getTipoOrigen() == filtroTipo).toList();
            }
        }

        return lista.stream().map(c -> mapConversacionDTO(c, claims)).toList();
    }

    @Transactional(readOnly = true)
    public ConversacionResponseDTO obtenerPorId(Long id, TokenUtils.TokenClaims claims) {
        Conversacion conversacion = obtenerYValidarAcceso(id, claims);
        return mapConversacionDTO(conversacion, claims);
    }

    @Transactional
    public List<MensajeResponseDTO> listarMensajes(Long conversacionId, TokenUtils.TokenClaims claims) {
        Conversacion conversacion = obtenerYValidarAcceso(conversacionId, claims);
        List<Mensaje> mensajes = mensajeRepository.findByConversacionIdOrderByFechaHoraAsc(conversacion.getId());

        boolean esAdmin = "ADMIN".equalsIgnoreCase(claims.rol());
        // Marcar como leídos los mensajes dirigidos a este usuario
        for (Mensaje m : mensajes) {
            if (esAdmin && !Boolean.TRUE.equals(m.getLeidoPorAdmin())) {
                m.setLeidoPorAdmin(true);
                mensajeRepository.save(m);
            } else if (!esAdmin && !Boolean.TRUE.equals(m.getLeidoPorCliente())) {
                m.setLeidoPorCliente(true);
                mensajeRepository.save(m);
            }
        }

        return mensajes.stream().map(this::mapMensajeDTO).toList();
    }

    @Transactional
    public MensajeResponseDTO enviarMensaje(Long conversacionId, CrearMensajeDTO dto, TokenUtils.TokenClaims claims) {
        Conversacion conversacion = obtenerYValidarAcceso(conversacionId, claims);

        if (conversacion.getEstado() == EstadoConversacion.CERRADA) {
            throw new BadRequestException("Esta conversación se encuentra cerrada. No es posible enviar nuevos mensajes.");
        }

        boolean esAdmin = "ADMIN".equalsIgnoreCase(claims.rol());
        String rolRemitente = esAdmin ? "ADMIN" : "CLIENTE";
        String nombreRemitente = claims.nombre() != null && !claims.nombre().isBlank() ? claims.nombre() : (esAdmin ? "Soporte Noctis" : "Cliente");

        Mensaje mensaje = new Mensaje();
        mensaje.setConversacionId(conversacion.getId());
        mensaje.setRemitenteId(claims.id());
        mensaje.setRemitenteRol(rolRemitente);
        mensaje.setRemitenteNombre(nombreRemitente);
        mensaje.setContenido(dto.contenido().trim());
        mensaje.setFechaHora(LocalDateTime.now());
        mensaje.setLeidoPorAdmin(esAdmin);
        mensaje.setLeidoPorCliente(!esAdmin);

        Mensaje guardado = mensajeRepository.save(mensaje);

        // Actualizar última actividad de la conversación
        conversacion.setFechaUltimaActividad(LocalDateTime.now());
        conversacionRepository.save(conversacion);

        log.info("Mensaje enviado en conversación {} por {} ({})", conversacionId, nombreRemitente, rolRemitente);
        return mapMensajeDTO(guardado);
    }

    @Transactional
    public ConversacionResponseDTO cerrarConversacion(Long conversacionId, TokenUtils.TokenClaims claims) {
        Conversacion conversacion = obtenerYValidarAcceso(conversacionId, claims);
        conversacion.setEstado(EstadoConversacion.CERRADA);
        conversacion.setFechaUltimaActividad(LocalDateTime.now());
        Conversacion actualizada = conversacionRepository.save(conversacion);

        Mensaje aviso = new Mensaje();
        aviso.setConversacionId(conversacion.getId());
        aviso.setRemitenteId(0L);
        aviso.setRemitenteRol("SISTEMA");
        aviso.setRemitenteNombre("Sistema");
        aviso.setContenido("Conversación cerrada. El historial se conserva en modo solo lectura.");
        aviso.setFechaHora(LocalDateTime.now());
        aviso.setLeidoPorAdmin(true);
        aviso.setLeidoPorCliente(true);
        mensajeRepository.save(aviso);

        log.info("Conversación {} cerrada por {}", conversacionId, claims.email());
        return mapConversacionDTO(actualizada, claims);
    }

    private Conversacion obtenerYValidarAcceso(Long conversacionId, TokenUtils.TokenClaims claims) {
        if (claims == null) {
            throw new BadRequestException("Autenticación requerida");
        }
        Conversacion conversacion = conversacionRepository.findById(conversacionId)
                .orElseThrow(() -> new ResourceNotFoundException("Conversación no encontrada con ID: " + conversacionId));

        boolean esAdmin = "ADMIN".equalsIgnoreCase(claims.rol());
        if (!esAdmin && !claims.id().equals(conversacion.getClienteId())) {
            throw new BadRequestException("No tienes autorización para acceder a esta conversación");
        }
        return conversacion;
    }

    private ConversacionResponseDTO mapConversacionDTO(Conversacion c, TokenUtils.TokenClaims claims) {
        boolean esAdmin = claims != null && "ADMIN".equalsIgnoreCase(claims.rol());
        long unread = esAdmin
                ? mensajeRepository.countByConversacionIdAndLeidoPorAdminFalse(c.getId())
                : mensajeRepository.countByConversacionIdAndLeidoPorClienteFalse(c.getId());

        List<Mensaje> msgs = mensajeRepository.findByConversacionIdOrderByFechaHoraAsc(c.getId());
        String ultimoMsg = msgs.isEmpty() ? "" : msgs.get(msgs.size() - 1).getContenido();

        return new ConversacionResponseDTO(
                c.getId(),
                c.getTipoOrigen(),
                c.getEntidadId(),
                c.getClienteId(),
                c.getTituloContexto(),
                c.getEstado(),
                c.getFechaCreacion(),
                c.getFechaUltimaActividad(),
                unread,
                ultimoMsg
        );
    }

    private MensajeResponseDTO mapMensajeDTO(Mensaje m) {
        return new MensajeResponseDTO(
                m.getId(),
                m.getConversacionId(),
                m.getRemitenteId(),
                m.getRemitenteRol(),
                m.getRemitenteNombre(),
                m.getContenido(),
                m.getFechaHora(),
                m.getLeidoPorAdmin(),
                m.getLeidoPorCliente()
        );
    }
}
