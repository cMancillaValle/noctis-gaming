package com.noctis.inventario.repository;

import com.noctis.inventario.model.InventarioItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface InventarioItemRepository extends JpaRepository<InventarioItem, Long> {
    Optional<InventarioItem> findByProductoId(Long productoId);
    boolean existsByProductoId(Long productoId);
}
