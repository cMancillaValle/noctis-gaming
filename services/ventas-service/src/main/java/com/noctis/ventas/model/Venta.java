package com.noctis.ventas.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "ventas", indexes = {
        @Index(name = "idx_venta_numero", columnList = "numero_venta", unique = true),
        @Index(name = "idx_venta_operacion", columnList = "operacion_id", unique = true),
        @Index(name = "idx_venta_cliente", columnList = "cliente_id")
})
public class Venta {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "numero_venta", nullable = false, unique = true, length = 50)
    private String numeroVenta;

    @Column(name = "operacion_id", nullable = false, unique = true, length = 100)
    private String operacionId;

    @Column(name = "cliente_id", nullable = false)
    private Long clienteId;

    @Column(name = "direccion_entrega", nullable = false, length = 250)
    private String direccionEntrega;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal total;

    @Column(nullable = false, length = 30)
    private String estado;

    @Column(name = "numero_factura", length = 50)
    private String numeroFactura;

    @Column(name = "fecha_creacion", nullable = false)
    private LocalDateTime fechaCreacion;

    @OneToMany(mappedBy = "venta", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<VentaItem> items = new ArrayList<>();

    public Venta() {
    }

    public Venta(Long id, String numeroVenta, String operacionId, Long clienteId, String direccionEntrega, BigDecimal total, String estado, String numeroFactura, LocalDateTime fechaCreacion) {
        this.id = id;
        this.numeroVenta = numeroVenta;
        this.operacionId = operacionId;
        this.clienteId = clienteId;
        this.direccionEntrega = direccionEntrega;
        this.total = total;
        this.estado = estado;
        this.numeroFactura = numeroFactura;
        this.fechaCreacion = fechaCreacion != null ? fechaCreacion : LocalDateTime.now();
    }

    @PrePersist
    public void prePersist() {
        if (this.fechaCreacion == null) {
            this.fechaCreacion = LocalDateTime.now();
        }
    }

    public void addItem(VentaItem item) {
        items.add(item);
        item.setVenta(this);
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNumeroVenta() {
        return numeroVenta;
    }

    public void setNumeroVenta(String numeroVenta) {
        this.numeroVenta = numeroVenta;
    }

    public String getOperacionId() {
        return operacionId;
    }

    public void setOperacionId(String operacionId) {
        this.operacionId = operacionId;
    }

    public Long getClienteId() {
        return clienteId;
    }

    public void setClienteId(Long clienteId) {
        this.clienteId = clienteId;
    }

    public String getDireccionEntrega() {
        return direccionEntrega;
    }

    public void setDireccionEntrega(String direccionEntrega) {
        this.direccionEntrega = direccionEntrega;
    }

    public BigDecimal getTotal() {
        return total;
    }

    public void setTotal(BigDecimal total) {
        this.total = total;
    }

    public String getEstado() {
        return estado;
    }

    public void setEstado(String estado) {
        this.estado = estado;
    }

    public String getNumeroFactura() {
        return numeroFactura;
    }

    public void setNumeroFactura(String numeroFactura) {
        this.numeroFactura = numeroFactura;
    }

    public LocalDateTime getFechaCreacion() {
        return fechaCreacion;
    }

    public void setFechaCreacion(LocalDateTime fechaCreacion) {
        this.fechaCreacion = fechaCreacion;
    }

    public List<VentaItem> getItems() {
        return items;
    }

    public void setItems(List<VentaItem> items) {
        this.items = items;
    }
}
