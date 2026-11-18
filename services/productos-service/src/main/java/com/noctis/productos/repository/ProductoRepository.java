package com.noctis.productos.repository;

import com.noctis.productos.model.Producto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductoRepository extends JpaRepository<Producto, Long> {
    List<Producto> findByActivoTrue();
    List<Producto> findByCategoriaAndActivoTrue(String categoria);
    List<Producto> findByNombreContainingIgnoreCaseAndActivoTrue(String nombre);
    boolean existsByNombre(String nombre);
    
    @Query("SELECT DISTINCT p.categoria FROM Producto p WHERE p.activo = true ORDER BY p.categoria ASC")
    List<String> findDistinctCategorias();
}
