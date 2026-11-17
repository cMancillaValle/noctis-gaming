package com.noctis.facturacion.repository;

import com.noctis.facturacion.model.Factura;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface FacturaRepository extends JpaRepository<Factura, Long> {
    Optional<Factura> findByVentaId(Long ventaId);
    Optional<Factura> findByNumeroFactura(String numeroFactura);
    boolean existsByVentaId(Long ventaId);
}
