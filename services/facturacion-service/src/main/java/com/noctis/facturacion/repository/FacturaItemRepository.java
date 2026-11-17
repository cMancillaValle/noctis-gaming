package com.noctis.facturacion.repository;

import com.noctis.facturacion.model.FacturaItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FacturaItemRepository extends JpaRepository<FacturaItem, Long> {
    List<FacturaItem> findByFacturaId(Long facturaId);
}
