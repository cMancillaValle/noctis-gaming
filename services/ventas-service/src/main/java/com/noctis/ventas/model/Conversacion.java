package com.noctis.ventas.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(
    name = "conversaciones",
    uniqueConstraints = {
        @UniqueConstraint(name = "uk_conversacion_origen_entidad", columnNames = {"tipoOrigen", "entidadId"})
    }
)
public class Conversacion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private TipoOrigenConversacion tipoOrigen;

    @Column(nullable = false)
    private Long entidadId;

    @Column(nullable = false)
    private Long clienteId;

    @Column(nullable = false, length = 150)
    private String tituloContexto;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private EstadoConversacion estado;

    @Column(nullable = false)
    private LocalDateTime fechaCreacion;

    @Column(nullable = false)
    private LocalDateTime fechaUltimaActividad;

    public Conversacion() {}

    public Conversacion(Long id, TipoOrigenConversacion tipoOrigen, Long entidadId, Long clienteId,
                        String tituloContexto, EstadoConversacion estado,
                        LocalDateTime fechaCreacion, LocalDateTime fechaUltimaActividad) {
        this.id = id;
        this.tipoOrigen = tipoOrigen;
        this.entidadId = entidadId;
        this.clienteId = clienteId;
        this.tituloContexto = tituloContexto;
        this.estado = estado;
        this.fechaCreacion = fechaCreacion;
        this.fechaUltimaActividad = fechaUltimaActividad;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public TipoOrigenConversacion getTipoOrigen() { return tipoOrigen; }
    public void setTipoOrigen(TipoOrigenConversacion tipoOrigen) { this.tipoOrigen = tipoOrigen; }

    public Long getEntidadId() { return entidadId; }
    public void setEntidadId(Long entidadId) { this.entidadId = entidadId; }

    public Long getClienteId() { return clienteId; }
    public void setClienteId(Long clienteId) { this.clienteId = clienteId; }

    public String getTituloContexto() { return tituloContexto; }
    public void setTituloContexto(String tituloContexto) { this.tituloContexto = tituloContexto; }

    public EstadoConversacion getEstado() { return estado; }
    public void setEstado(EstadoConversacion estado) { this.estado = estado; }

    public LocalDateTime getFechaCreacion() { return fechaCreacion; }
    public void setFechaCreacion(LocalDateTime fechaCreacion) { this.fechaCreacion = fechaCreacion; }

    public LocalDateTime getFechaUltimaActividad() { return fechaUltimaActividad; }
    public void setFechaUltimaActividad(LocalDateTime fechaUltimaActividad) { this.fechaUltimaActividad = fechaUltimaActividad; }
}
