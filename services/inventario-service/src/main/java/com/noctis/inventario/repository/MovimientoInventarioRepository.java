package com.noctis.inventario.repository;

import com.noctis.inventario.model.MovimientoInventario;
import com.noctis.inventario.model.TipoMovimiento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MovimientoInventarioRepository extends JpaRepository<MovimientoInventario, Long> {
    List<MovimientoInventario> findByOperacionId(String operacionId);
    boolean existsByOperacionIdAndTipoMovimiento(String operacionId, TipoMovimiento tipoMovimiento);
    List<MovimientoInventario> findByProductoIdOrderByFechaDesc(Long productoId);
}
