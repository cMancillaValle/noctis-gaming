package com.noctis.ventas.repository;

import com.noctis.ventas.model.Conversacion;
import com.noctis.ventas.model.TipoOrigenConversacion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ConversacionRepository extends JpaRepository<Conversacion, Long> {
    Optional<Conversacion> findByTipoOrigenAndEntidadId(TipoOrigenConversacion tipoOrigen, Long entidadId);
    List<Conversacion> findByClienteIdOrderByFechaUltimaActividadDesc(Long clienteId);
    List<Conversacion> findAllByOrderByFechaUltimaActividadDesc();
    List<Conversacion> findByTipoOrigenOrderByFechaUltimaActividadDesc(TipoOrigenConversacion tipoOrigen);
}
