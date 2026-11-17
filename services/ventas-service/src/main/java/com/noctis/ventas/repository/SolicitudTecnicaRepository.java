package com.noctis.ventas.repository;

import com.noctis.ventas.model.EstadoSolicitud;
import com.noctis.ventas.model.SolicitudTecnica;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SolicitudTecnicaRepository extends JpaRepository<SolicitudTecnica, Long> {
    List<SolicitudTecnica> findByClienteIdOrderByFechaCreacionDesc(Long clienteId);
    List<SolicitudTecnica> findAllByOrderByFechaCreacionDesc();
    List<SolicitudTecnica> findByEstadoOrderByFechaCreacionDesc(EstadoSolicitud estado);
    Optional<SolicitudTecnica> findByNumeroSolicitud(String numeroSolicitud);
}
