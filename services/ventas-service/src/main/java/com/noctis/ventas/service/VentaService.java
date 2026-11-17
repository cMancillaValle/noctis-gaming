package com.noctis.ventas.service;

import com.noctis.ventas.client.ClientesClient;
import com.noctis.ventas.client.FacturacionClient;
import com.noctis.ventas.client.InventarioClient;
import com.noctis.ventas.client.ProductosClient;
import com.noctis.ventas.client.dto.*;
import com.noctis.ventas.dto.*;
import com.noctis.ventas.exception.ResourceNotFoundException;
import com.noctis.ventas.exception.VentaException;
import com.noctis.ventas.model.Venta;
import com.noctis.ventas.model.VentaItem;
import com.noctis.ventas.repository.VentaRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class VentaService {

    private static final Logger log = LoggerFactory.getLogger(VentaService.class);

    private final VentaRepository ventaRepository;
    private final ClientesClient clientesClient;
    private final ProductosClient productosClient;
    private final InventarioClient inventarioClient;
    private final FacturacionClient facturacionClient;

    public VentaService(VentaRepository ventaRepository,
                        ClientesClient clientesClient,
                        ProductosClient productosClient,
                        InventarioClient inventarioClient,
                        FacturacionClient facturacionClient) {
        this.ventaRepository = ventaRepository;
        this.clientesClient = clientesClient;
        this.productosClient = productosClient;
        this.inventarioClient = inventarioClient;
        this.facturacionClient = facturacionClient;
    }

    @Transactional
    public VentaResponseDTO procesarVenta(CrearVentaRequestDTO request) {
        String operacionId = "OP-VTA-" + UUID.randomUUID().toString();
        log.info("Iniciando orquestación de compra. OperacionId: {}, Cliente: {}", operacionId, request.clienteId());

        // 1. Validar existencia y datos del cliente en clientes-service
        ClienteClientDTO cliente = clientesClient.obtenerCliente(request.clienteId());
        if (cliente == null) {
            throw new VentaException("Cliente no encontrado o inactivo");
        }

        // 2. Consultar y validar productos en productos-service y calcular precios
        BigDecimal totalCalculado = BigDecimal.ZERO;
        List<ItemCalculado> itemsCalculados = new ArrayList<>();
        List<ItemDescuentoClientDTO> itemsInventario = new ArrayList<>();

        for (ItemVentaRequestDTO itemReq : request.items()) {
            ProductoClientDTO producto = productosClient.obtenerProducto(itemReq.productoId());
            if (producto == null || !producto.activo()) {
                throw new VentaException("El producto ID " + itemReq.productoId() + " no está disponible para la venta");
            }

            BigDecimal subtotal = producto.precio().multiply(BigDecimal.valueOf(itemReq.cantidad()));
            totalCalculado = totalCalculado.add(subtotal);

            itemsCalculados.add(new ItemCalculado(
                    producto.id(),
                    producto.nombre(),
                    itemReq.cantidad(),
                    producto.precio(),
                    subtotal
            ));

            itemsInventario.add(new ItemDescuentoClientDTO(producto.id(), itemReq.cantidad()));
        }

        // 3. Descontar existencias de forma segura en inventario-service con operacionId
        boolean stockDescontado = false;
        try {
            ResultadoOperacionStockClientDTO resultadoStock = inventarioClient.descontarStock(
                    operacionId,
                    itemsInventario,
                    "Reserva para venta " + operacionId
            );
            if (resultadoStock != null && resultadoStock.exitoso()) {
                stockDescontado = true;
            } else {
                throw new VentaException("No fue posible reservar existencias en el inventario");
            }
        } catch (Exception ex) {
            log.error("Fallo al descontar existencias en inventario-service para {}", operacionId, ex);
            throw new VentaException("Rechazo de compra: " + ex.getMessage());
        }

        // 4. Registrar la venta en la base de datos local de ventas-service
        Venta venta = new Venta();
        String numeroVenta = String.format("VTA-2026-%05d", ventaRepository.count() + 1);
        venta.setNumeroVenta(numeroVenta);
        venta.setOperacionId(operacionId);
        venta.setClienteId(cliente.id());
        venta.setDireccionEntrega(request.direccionEntrega().trim());
        venta.setTotal(totalCalculado);
        venta.setEstado("PENDIENTE_FACTURACION");
        venta.setFechaCreacion(LocalDateTime.now());

        for (ItemCalculado itemCalc : itemsCalculados) {
            VentaItem vi = new VentaItem();
            vi.setProductoId(itemCalc.productoId());
            vi.setProductoNombre(itemCalc.nombre());
            vi.setCantidad(itemCalc.cantidad());
            vi.setPrecioUnitario(itemCalc.precioUnitario());
            vi.setSubtotalItem(itemCalc.subtotal());
            venta.addItem(vi);
        }

        Venta ventaGuardada = ventaRepository.save(venta);

        // 5. Generar la factura en facturacion-service (con estrategia de compensación ante fallo)
        try {
            List<ItemFacturaClientDTO> itemsFactura = itemsCalculados.stream()
                    .map(i -> new ItemFacturaClientDTO(i.productoId(), i.nombre(), i.cantidad(), i.precioUnitario()))
                    .toList();

            GenerarFacturaClientRequestDTO facturaRequest = new GenerarFacturaClientRequestDTO(
                    ventaGuardada.getId(),
                    cliente.id(),
                    cliente.nombre(),
                    cliente.email(),
                    request.direccionEntrega().trim(),
                    itemsFactura,
                    totalCalculado
            );

            FacturaClientResponseDTO factura = facturacionClient.generarFactura(facturaRequest);
            ventaGuardada.setNumeroFactura(factura.numeroFactura());
            ventaGuardada.setEstado("COMPLETADA");
            ventaGuardada = ventaRepository.save(ventaGuardada);

            log.info("Venta {} procesada y facturada exitosamente. Factura: {}",
                    ventaGuardada.getNumeroVenta(), ventaGuardada.getNumeroFactura());

        } catch (Exception ex) {
            log.error("Error al emitir factura para la venta {}. Iniciando compensación...", ventaGuardada.getId(), ex);
            // Compensación: devolver el stock retenido en inventario
            if (stockDescontado) {
                inventarioClient.reponerStock(operacionId, "Compensación por fallo en facturación: " + ex.getMessage());
            }
            ventaGuardada.setEstado("FALLIDA_COMPENSADA");
            ventaRepository.save(ventaGuardada);
            throw new VentaException("No fue posible completar la facturación. El inventario ha sido compensado y la orden cancelada.");
        }

        return mapToDTO(ventaGuardada);
    }

    @Transactional(readOnly = true)
    public List<VentaResponseDTO> listarTodas() {
        return ventaRepository.findAllByOrderByFechaCreacionDesc().stream().map(this::mapToDTO).toList();
    }

    @Transactional(readOnly = true)
    public VentaResponseDTO buscarPorId(Long id) {
        Venta venta = ventaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Venta no encontrada con ID: " + id));
        return mapToDTO(venta);
    }

    @Transactional(readOnly = true)
    public List<VentaResponseDTO> buscarPorCliente(Long clienteId) {
        return ventaRepository.findByClienteIdOrderByFechaCreacionDesc(clienteId).stream()
                .map(this::mapToDTO)
                .toList();
    }

    private VentaResponseDTO mapToDTO(Venta v) {
        List<VentaItemResponseDTO> items = v.getItems().stream()
                .map(i -> new VentaItemResponseDTO(
                        i.getId(),
                        i.getProductoId(),
                        i.getProductoNombre(),
                        i.getCantidad(),
                        i.getPrecioUnitario(),
                        i.getSubtotalItem()
                )).toList();

        return new VentaResponseDTO(
                v.getId(),
                v.getNumeroVenta(),
                v.getOperacionId(),
                v.getClienteId(),
                v.getDireccionEntrega(),
                v.getTotal(),
                v.getEstado(),
                v.getNumeroFactura(),
                v.getFechaCreacion(),
                items
        );
    }

    private record ItemCalculado(
            Long productoId,
            String nombre,
            Integer cantidad,
            BigDecimal precioUnitario,
            BigDecimal subtotal
    ) {}
}
