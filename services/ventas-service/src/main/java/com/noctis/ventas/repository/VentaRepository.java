package com.noctis.ventas.repository;

import com.noctis.ventas.model.Venta;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface VentaRepository extends JpaRepository<Venta, Long> {
    Optional<Venta> findByNumeroVenta(String numeroVenta);
    Optional<Venta> findByOperacionId(String operacionId);
    List<Venta> findByClienteIdOrderByFechaCreacionDesc(Long clienteId);
    List<Venta> findAllByOrderByFechaCreacionDesc();
}
