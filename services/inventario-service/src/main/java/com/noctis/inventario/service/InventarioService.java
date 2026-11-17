package com.noctis.inventario.service;

import com.noctis.inventario.dto.*;
import com.noctis.inventario.exception.ResourceNotFoundException;
import com.noctis.inventario.exception.StockInsuficienteException;
import com.noctis.inventario.model.InventarioItem;
import com.noctis.inventario.model.MovimientoInventario;
import com.noctis.inventario.model.TipoMovimiento;
import com.noctis.inventario.repository.InventarioItemRepository;
import com.noctis.inventario.repository.MovimientoInventarioRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class InventarioService {

    private static final Logger log = LoggerFactory.getLogger(InventarioService.class);

    private final InventarioItemRepository itemRepository;
    private final MovimientoInventarioRepository movimientoRepository;

    public InventarioService(InventarioItemRepository itemRepository, MovimientoInventarioRepository movimientoRepository) {
        this.itemRepository = itemRepository;
        this.movimientoRepository = movimientoRepository;
    }

    @Transactional(readOnly = true)
    public InventarioResponseDTO consultarPorProductoId(Long productoId) {
        InventarioItem item = itemRepository.findByProductoId(productoId)
                .orElseThrow(() -> new ResourceNotFoundException("No se encontró registro de inventario para el producto: " + productoId));
        return mapToDTO(item);
    }

    @Transactional(readOnly = true)
    public List<InventarioResponseDTO> listarTodo() {
        return itemRepository.findAll().stream().map(this::mapToDTO).toList();
    }

    @Transactional
    public ResultadoOperacionStockDTO descontarStock(DescontarStockRequestDTO request) {
        String operacionId = request.operacionId();
        log.info("Procesando descuento de inventario con operacionId: {}", operacionId);

        // Control de Idempotencia: Si la operación ya fue aplicada, responder exitosamente sin volver a descontar
        if (movimientoRepository.existsByOperacionIdAndTipoMovimiento(operacionId, TipoMovimiento.SALIDA_VENTA)) {
            log.warn("Operación {} ya fue procesada anteriormente. Respuesta idempotente.", operacionId);
            return new ResultadoOperacionStockDTO(operacionId, true, "Operación previamente ejecutada con éxito (idempotencia)", request.items().size());
        }

        // 1. Verificación previa de existencias de todos los items
        List<InventarioItem> itemsAfectados = new ArrayList<>();
        for (ItemDescuentoDTO itemDto : request.items()) {
            InventarioItem inv = itemRepository.findByProductoId(itemDto.productoId())
                    .orElseThrow(() -> new ResourceNotFoundException("Producto ID " + itemDto.productoId() + " no existe en el inventario"));

            if (inv.getCantidadDisponible() < itemDto.cantidad()) {
                throw new StockInsuficienteException(String.format(
                        "Stock insuficiente para producto ID %d. Solicitado: %d, Disponible: %d",
                        itemDto.productoId(), itemDto.cantidad(), inv.getCantidadDisponible()));
            }
            itemsAfectados.add(inv);
        }

        // 2. Ejecutar descuento y registrar movimientos de auditoría
        for (int i = 0; i < request.items().size(); i++) {
            ItemDescuentoDTO itemDto = request.items().get(i);
            InventarioItem inv = itemsAfectados.get(i);

            inv.setCantidadDisponible(inv.getCantidadDisponible() - itemDto.cantidad());
            itemRepository.save(inv);

            MovimientoInventario mov = new MovimientoInventario();
            mov.setOperacionId(operacionId);
            mov.setProductoId(inv.getProductoId());
            mov.setTipoMovimiento(TipoMovimiento.SALIDA_VENTA);
            mov.setCantidad(itemDto.cantidad());
            mov.setFecha(LocalDateTime.now());
            mov.setReferencia(request.referencia() != null ? request.referencia() : "Venta " + operacionId);
            movimientoRepository.save(mov);
        }

        log.info("Descuento de inventario exitoso para operacionId: {}. Items afectados: {}", operacionId, itemsAfectados.size());
        return new ResultadoOperacionStockDTO(operacionId, true, "Inventario descontado exitosamente", itemsAfectados.size());
    }

    @Transactional
    public ResultadoOperacionStockDTO reponerStock(ReponerStockRequestDTO request) {
        String operacionId = request.operacionId();
        log.warn("Iniciando compensación / reposición de inventario para operacionId: {}", operacionId);

        // Si ya fue compensado, responder idempotentemente
        if (movimientoRepository.existsByOperacionIdAndTipoMovimiento(operacionId, TipoMovimiento.COMPENSACION_CANCELACION)) {
            log.info("Operación {} ya fue compensada previamente.", operacionId);
            return new ResultadoOperacionStockDTO(operacionId, true, "Operación ya compensada previamente", 0);
        }

        List<MovimientoInventario> movimientosOriginales = movimientoRepository.findByOperacionId(operacionId).stream()
                .filter(m -> m.getTipoMovimiento() == TipoMovimiento.SALIDA_VENTA)
                .toList();

        if (movimientosOriginales.isEmpty()) {
            log.info("No se encontraron salidas de venta previas para compensar en operacionId: {}", operacionId);
            return new ResultadoOperacionStockDTO(operacionId, true, "No habían salidas que compensar", 0);
        }

        for (MovimientoInventario movOriginal : movimientosOriginales) {
            itemRepository.findByProductoId(movOriginal.getProductoId()).ifPresent(inv -> {
                inv.setCantidadDisponible(inv.getCantidadDisponible() + movOriginal.getCantidad());
                itemRepository.save(inv);

                MovimientoInventario compensacion = new MovimientoInventario();
                compensacion.setOperacionId(operacionId);
                compensacion.setProductoId(inv.getProductoId());
                compensacion.setTipoMovimiento(TipoMovimiento.COMPENSACION_CANCELACION);
                compensacion.setCantidad(movOriginal.getCantidad());
                compensacion.setFecha(LocalDateTime.now());
                compensacion.setReferencia("Compensación: " + (request.motivo() != null ? request.motivo() : "Fallo en flujo de venta"));
                movimientoRepository.save(compensacion);
            });
        }

        log.info("Compensación completada exitosamente para operacionId: {}", operacionId);
        return new ResultadoOperacionStockDTO(operacionId, true, "Compensación de inventario ejecutada", movimientosOriginales.size());
    }

    @Transactional
    public InventarioResponseDTO actualizarStock(Long productoId, ActualizarStockDTO dto) {
        InventarioItem item = itemRepository.findByProductoId(productoId)
                .orElseGet(() -> {
                    InventarioItem nuevo = new InventarioItem();
                    nuevo.setProductoId(productoId);
                    nuevo.setCantidadReservada(0);
                    return nuevo;
                });

        item.setCantidadDisponible(dto.cantidadDisponible());
        if (dto.ubicacionAlmacen() != null) {
            item.setUbicacionAlmacen(dto.ubicacionAlmacen());
        }

        InventarioItem guardado = itemRepository.save(item);

        MovimientoInventario mov = new MovimientoInventario();
        mov.setOperacionId("MANUAL-" + System.currentTimeMillis());
        mov.setProductoId(productoId);
        mov.setTipoMovimiento(TipoMovimiento.AJUSTE_MANUAL);
        mov.setCantidad(dto.cantidadDisponible());
        mov.setFecha(LocalDateTime.now());
        mov.setReferencia("Ajuste manual de stock por administrador");
        movimientoRepository.save(mov);

        return mapToDTO(guardado);
    }

    private InventarioResponseDTO mapToDTO(InventarioItem item) {
        return new InventarioResponseDTO(
                item.getId(),
                item.getProductoId(),
                item.getCantidadDisponible(),
                item.getCantidadReservada(),
                item.getUbicacionAlmacen(),
                item.getUltimaActualizacion()
        );
    }
}
