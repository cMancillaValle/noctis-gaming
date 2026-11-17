package com.noctis.ventas.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "mensajes")
public class Mensaje {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long conversacionId;

    @Column(nullable = false)
    private Long remitenteId;

    @Column(nullable = false, length = 30)
    private String remitenteRol;

    @Column(nullable = false, length = 150)
    private String remitenteNombre;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String contenido;

    @Column(nullable = false)
    private LocalDateTime fechaHora;

    @Column(nullable = false)
    private Boolean leidoPorAdmin;

    @Column(nullable = false)
    private Boolean leidoPorCliente;

    public Mensaje() {}

    public Mensaje(Long id, Long conversacionId, Long remitenteId, String remitenteRol,
                   String remitenteNombre, String contenido, LocalDateTime fechaHora,
                   Boolean leidoPorAdmin, Boolean leidoPorCliente) {
        this.id = id;
        this.conversacionId = conversacionId;
        this.remitenteId = remitenteId;
        this.remitenteRol = remitenteRol;
        this.remitenteNombre = remitenteNombre;
        this.contenido = contenido;
        this.fechaHora = fechaHora;
        this.leidoPorAdmin = leidoPorAdmin;
        this.leidoPorCliente = leidoPorCliente;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getConversacionId() { return conversacionId; }
    public void setConversacionId(Long conversacionId) { this.conversacionId = conversacionId; }

    public Long getRemitenteId() { return remitenteId; }
    public void setRemitenteId(Long remitenteId) { this.remitenteId = remitenteId; }

    public String getRemitenteRol() { return remitenteRol; }
    public void setRemitenteRol(String remitenteRol) { this.remitenteRol = remitenteRol; }

    public String getRemitenteNombre() { return remitenteNombre; }
    public void setRemitenteNombre(String remitenteNombre) { this.remitenteNombre = remitenteNombre; }

    public String getContenido() { return contenido; }
    public void setContenido(String contenido) { this.contenido = contenido; }

    public LocalDateTime getFechaHora() { return fechaHora; }
    public void setFechaHora(LocalDateTime fechaHora) { this.fechaHora = fechaHora; }

    public Boolean getLeidoPorAdmin() { return leidoPorAdmin; }
    public void setLeidoPorAdmin(Boolean leidoPorAdmin) { this.leidoPorAdmin = leidoPorAdmin; }

    public Boolean getLeidoPorCliente() { return leidoPorCliente; }
    public void setLeidoPorCliente(Boolean leidoPorCliente) { this.leidoPorCliente = leidoPorCliente; }
}
