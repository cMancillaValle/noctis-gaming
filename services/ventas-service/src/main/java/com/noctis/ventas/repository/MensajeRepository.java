package com.noctis.ventas.repository;

import com.noctis.ventas.model.Mensaje;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MensajeRepository extends JpaRepository<Mensaje, Long> {
    List<Mensaje> findByConversacionIdOrderByFechaHoraAsc(Long conversacionId);
    long countByConversacionIdAndLeidoPorAdminFalse(Long conversacionId);
    long countByConversacionIdAndLeidoPorClienteFalse(Long conversacionId);
}
