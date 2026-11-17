package com.noctis.ventas.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "solicitudes_tecnicas")
public class SolicitudTecnica {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String numeroSolicitud;

    @Column(nullable = false)
    private Long clienteId;

    @Column(nullable = false, length = 150)
    private String clienteNombre;

    @Column(nullable = false, length = 50)
    private String clienteTelefono;

    @Column(nullable = false, length = 150)
    private String clienteEmail;

    @Column(nullable = false, length = 80)
    private String servicioTipo;

    @Column(nullable = false, length = 80)
    private String dispositivoTipo;

    @Column(nullable = false, length = 150)
    private String marcaModelo;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String sintomas;

    @Column(nullable = false, length = 100)
    private String ciudad;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private EstadoSolicitud estado;

    @Column(nullable = false)
    private LocalDateTime fechaCreacion;

    @Column(nullable = false)
    private LocalDateTime fechaActualizacion;

    public SolicitudTecnica() {}

    public SolicitudTecnica(Long id, String numeroSolicitud, Long clienteId, String clienteNombre,
                            String clienteTelefono, String clienteEmail, String servicioTipo,
                            String dispositivoTipo, String marcaModelo, String sintomas,
                            String ciudad, EstadoSolicitud estado, LocalDateTime fechaCreacion,
                            LocalDateTime fechaActualizacion) {
        this.id = id;
        this.numeroSolicitud = numeroSolicitud;
        this.clienteId = clienteId;
        this.clienteNombre = clienteNombre;
        this.clienteTelefono = clienteTelefono;
        this.clienteEmail = clienteEmail;
        this.servicioTipo = servicioTipo;
        this.dispositivoTipo = dispositivoTipo;
        this.marcaModelo = marcaModelo;
        this.sintomas = sintomas;
        this.ciudad = ciudad;
        this.estado = estado;
        this.fechaCreacion = fechaCreacion;
        this.fechaActualizacion = fechaActualizacion;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getNumeroSolicitud() { return numeroSolicitud; }
    public void setNumeroSolicitud(String numeroSolicitud) { this.numeroSolicitud = numeroSolicitud; }

    public Long getClienteId() { return clienteId; }
    public void setClienteId(Long clienteId) { this.clienteId = clienteId; }

    public String getClienteNombre() { return clienteNombre; }
    public void setClienteNombre(String clienteNombre) { this.clienteNombre = clienteNombre; }

    public String getClienteTelefono() { return clienteTelefono; }
    public void setClienteTelefono(String clienteTelefono) { this.clienteTelefono = clienteTelefono; }

    public String getClienteEmail() { return clienteEmail; }
    public void setClienteEmail(String clienteEmail) { this.clienteEmail = clienteEmail; }

    public String getServicioTipo() { return servicioTipo; }
    public void setServicioTipo(String servicioTipo) { this.servicioTipo = servicioTipo; }

    public String getDispositivoTipo() { return dispositivoTipo; }
    public void setDispositivoTipo(String dispositivoTipo) { this.dispositivoTipo = dispositivoTipo; }

    public String getMarcaModelo() { return marcaModelo; }
    public void setMarcaModelo(String marcaModelo) { this.marcaModelo = marcaModelo; }

    public String getSintomas() { return sintomas; }
    public void setSintomas(String sintomas) { this.sintomas = sintomas; }

    public String getCiudad() { return ciudad; }
    public void setCiudad(String ciudad) { this.ciudad = ciudad; }

    public EstadoSolicitud getEstado() { return estado; }
    public void setEstado(EstadoSolicitud estado) { this.estado = estado; }

    public LocalDateTime getFechaCreacion() { return fechaCreacion; }
    public void setFechaCreacion(LocalDateTime fechaCreacion) { this.fechaCreacion = fechaCreacion; }

    public LocalDateTime getFechaActualizacion() { return fechaActualizacion; }
    public void setFechaActualizacion(LocalDateTime fechaActualizacion) { this.fechaActualizacion = fechaActualizacion; }
}
