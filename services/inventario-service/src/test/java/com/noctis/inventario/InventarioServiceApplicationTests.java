package com.noctis.inventario;

import com.noctis.inventario.dto.*;
import com.noctis.inventario.exception.StockInsuficienteException;
import com.noctis.inventario.service.InventarioService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
class InventarioServiceApplicationTests {

    @Autowired
    private InventarioService inventarioService;

    @Test
    @DisplayName("Contexto de inventario carga correctamente")
    void contextLoads() {
        assertNotNull(inventarioService);
    }

    @Test
    @DisplayName("Debe consultar stock disponible del producto 1")
    void debeConsultarStock() {
        InventarioResponseDTO item = inventarioService.consultarPorProductoId(1L);
        assertNotNull(item);
        assertTrue(item.cantidadDisponible() > 0);
    }

    @Test
    @DisplayName("Debe descontar stock de forma segura e idempotente")
    void debeDescontarStockEIdempotencia() {
        InventarioResponseDTO inicial = inventarioService.consultarPorProductoId(3L);
        int cantidadInicial = inicial.cantidadDisponible();

        String operacionId = "TEST-OP-" + System.currentTimeMillis();
        DescontarStockRequestDTO request = new DescontarStockRequestDTO(
                operacionId,
                List.of(new ItemDescuentoDTO(3L, 2)),
                "Prueba unitaria de venta"
        );

        ResultadoOperacionStockDTO resultado1 = inventarioService.descontarStock(request);
        assertTrue(resultado1.exitoso());

        InventarioResponseDTO despues = inventarioService.consultarPorProductoId(3L);
        assertEquals(cantidadInicial - 2, despues.cantidadDisponible());

        // Idempotencia: segunda llamada con mismo operacionId no debe descontar dos veces
        ResultadoOperacionStockDTO resultado2 = inventarioService.descontarStock(request);
        assertTrue(resultado2.exitoso());

        InventarioResponseDTO despuesIdempotente = inventarioService.consultarPorProductoId(3L);
        assertEquals(cantidadInicial - 2, despuesIdempotente.cantidadDisponible());
    }

    @Test
    @DisplayName("Debe rechazar compras cuando las existencias son insuficientes")
    void debeRechazarStockInsuficiente() {
        String operacionId = "TEST-EXCESO-" + System.currentTimeMillis();
        DescontarStockRequestDTO request = new DescontarStockRequestDTO(
                operacionId,
                List.of(new ItemDescuentoDTO(2L, 99999)),
                "Prueba sin existencias"
        );

        assertThrows(StockInsuficienteException.class, () -> inventarioService.descontarStock(request));
    }

    @Test
    @DisplayName("Debe compensar / reponer stock correctamente ante reversión")
    void debeReponerStockCompensacion() {
        InventarioResponseDTO inicial = inventarioService.consultarPorProductoId(4L);
        int cantidadInicial = inicial.cantidadDisponible();

        String operacionId = "TEST-COMPENSAR-" + System.currentTimeMillis();
        DescontarStockRequestDTO requestDescuento = new DescontarStockRequestDTO(
                operacionId,
                List.of(new ItemDescuentoDTO(4L, 3)),
                "Descuento previo a compensación"
        );

        inventarioService.descontarStock(requestDescuento);
        assertEquals(cantidadInicial - 3, inventarioService.consultarPorProductoId(4L).cantidadDisponible());

        ReponerStockRequestDTO requestCompensacion = new ReponerStockRequestDTO(
                operacionId,
                "Cancelación de compra de prueba"
        );
        ResultadoOperacionStockDTO resultadoCompensacion = inventarioService.reponerStock(requestCompensacion);
        assertTrue(resultadoCompensacion.exitoso());

        assertEquals(cantidadInicial, inventarioService.consultarPorProductoId(4L).cantidadDisponible());
    }
}
