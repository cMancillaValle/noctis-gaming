package com.noctis.facturacion.service;

import com.noctis.facturacion.dto.FacturaItemResponseDTO;
import com.noctis.facturacion.dto.FacturaResponseDTO;
import com.noctis.facturacion.dto.GenerarFacturaRequestDTO;
import com.noctis.facturacion.dto.ItemFacturaDTO;
import com.noctis.facturacion.exception.ResourceNotFoundException;
import com.noctis.facturacion.model.Factura;
import com.noctis.facturacion.model.FacturaItem;
import com.noctis.facturacion.repository.FacturaRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class FacturaService {

    private static final Logger log = LoggerFactory.getLogger(FacturaService.class);

    private final FacturaRepository facturaRepository;

    public FacturaService(FacturaRepository facturaRepository) {
        this.facturaRepository = facturaRepository;
    }

    @Transactional
    public FacturaResponseDTO generarFactura(GenerarFacturaRequestDTO request) {
        log.info("Generando factura para la venta ID: {}", request.ventaId());

        // Idempotencia: Si ya existe factura para esta venta, retornarla
        if (facturaRepository.existsByVentaId(request.ventaId())) {
            log.info("Factura para la venta ID {} ya existe. Devolviendo registro existente.", request.ventaId());
            Factura facturaExistente = facturaRepository.findByVentaId(request.ventaId()).orElseThrow();
            return mapToDTO(facturaExistente);
        }

        // Cálculo de subtotal e impuestos (19% IVA incluido/calculado)
        BigDecimal total = request.total();
        // Base gravable = Total / 1.19
        BigDecimal subtotal = total.divide(new BigDecimal("1.19"), 2, RoundingMode.HALF_UP);
        BigDecimal impuestos = total.subtract(subtotal);

        String numeroFactura = String.format("FAC-2026-%05d", facturaRepository.count() + 1);

        Factura factura = new Factura();
        factura.setNumeroFactura(numeroFactura);
        factura.setVentaId(request.ventaId());
        factura.setFechaEmision(LocalDateTime.now());
        factura.setClienteId(request.clienteId());
        factura.setClienteNombre(request.clienteNombre().trim());
        factura.setClienteEmail(request.clienteEmail().trim());
        factura.setClienteDireccion(request.clienteDireccion().trim());
        factura.setSubtotal(subtotal);
        factura.setImpuestos(impuestos);
        factura.setTotal(total);
        factura.setEstado("EMITIDA");

        for (ItemFacturaDTO itemDto : request.items()) {
            BigDecimal subtotalItem = itemDto.precioUnitario().multiply(BigDecimal.valueOf(itemDto.cantidad()));
            FacturaItem item = new FacturaItem();
            item.setProductoId(itemDto.productoId());
            item.setProductoNombre(itemDto.productoNombre());
            item.setCantidad(itemDto.cantidad());
            item.setPrecioUnitario(itemDto.precioUnitario());
            item.setSubtotalItem(subtotalItem);
            factura.addItem(item);
        }

        Factura guardada = facturaRepository.save(factura);
        log.info("Factura {} generada exitosamente con ID interno {}.", guardada.getNumeroFactura(), guardada.getId());

        return mapToDTO(guardada);
    }

    @Transactional(readOnly = true)
    public List<FacturaResponseDTO> listarTodas() {
        return facturaRepository.findAll().stream().map(this::mapToDTO).toList();
    }

    @Transactional(readOnly = true)
    public FacturaResponseDTO buscarPorId(Long id) {
        Factura factura = facturaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Factura no encontrada con id: " + id));
        return mapToDTO(factura);
    }

    @Transactional(readOnly = true)
    public FacturaResponseDTO buscarPorVentaId(Long ventaId) {
        Factura factura = facturaRepository.findByVentaId(ventaId)
                .orElseThrow(() -> new ResourceNotFoundException("No se encontró factura asociada a la venta: " + ventaId));
        return mapToDTO(factura);
    }

    public FacturaResponseDTO mapToDTO(Factura f) {
        List<FacturaItemResponseDTO> itemsDto = f.getItems().stream()
                .map(i -> new FacturaItemResponseDTO(
                        i.getId(),
                        i.getProductoId(),
                        i.getProductoNombre(),
                        i.getCantidad(),
                        i.getPrecioUnitario(),
                        i.getSubtotalItem()
                )).toList();

        return new FacturaResponseDTO(
                f.getId(),
                f.getNumeroFactura(),
                f.getVentaId(),
                f.getFechaEmision(),
                f.getClienteId(),
                f.getClienteNombre(),
                f.getClienteEmail(),
                f.getClienteDireccion(),
                f.getSubtotal(),
                f.getImpuestos(),
                f.getTotal(),
                f.getEstado(),
                itemsDto
        );
    }
}
