package com.noctis.ventas;

import com.noctis.ventas.client.ClientesClient;
import com.noctis.ventas.client.FacturacionClient;
import com.noctis.ventas.client.InventarioClient;
import com.noctis.ventas.client.ProductosClient;
import com.noctis.ventas.client.dto.*;
import com.noctis.ventas.dto.CrearVentaRequestDTO;
import com.noctis.ventas.dto.ItemVentaRequestDTO;
import com.noctis.ventas.dto.VentaResponseDTO;
import com.noctis.ventas.exception.VentaException;
import com.noctis.ventas.service.VentaService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.context.ActiveProfiles;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@SpringBootTest
@ActiveProfiles("test")
class VentasServiceApplicationTests {

    @Autowired
    private VentaService ventaService;

    @MockBean
    private ClientesClient clientesClient;

    @MockBean
    private ProductosClient productosClient;

    @MockBean
    private InventarioClient inventarioClient;

    @MockBean
    private FacturacionClient facturacionClient;

    @Test
    @DisplayName("Debe procesar una venta completa y exitosa comunicándose con todos los microservicios")
    void debeProcesarVentaExitosa() {
        // Mock Cliente
        when(clientesClient.obtenerCliente(1L)).thenReturn(
                new ClienteClientDTO(1L, "Juan Pérez", "juan@test.com", "3001234567", "Carrera 7 # 72-10")
        );

        // Mock Producto
        when(productosClient.obtenerProducto(1L)).thenReturn(
                new ProductoClientDTO(1L, "PlayStation 5", "Consola", new BigDecimal("2899900.00"), "Consolas", null, true)
        );

        // Mock Inventario
        when(inventarioClient.descontarStock(anyString(), anyList(), anyString())).thenReturn(
                new ResultadoOperacionStockClientDTO("OP-1", true, "OK", 1)
        );

        // Mock Facturación
        when(facturacionClient.generarFactura(any(GenerarFacturaClientRequestDTO.class))).thenReturn(
                new FacturaClientResponseDTO(10L, "FAC-2026-00001", 1L, LocalDateTime.now(), new BigDecimal("2899900.00"), "EMITIDA")
        );

        CrearVentaRequestDTO request = new CrearVentaRequestDTO(
                1L,
                "Carrera 7 # 72-10, Bogotá",
                List.of(new ItemVentaRequestDTO(1L, 1))
        );

        VentaResponseDTO venta = ventaService.procesarVenta(request);

        assertNotNull(venta);
        assertNotNull(venta.id());
        assertEquals("COMPLETADA", venta.estado());
        assertEquals("FAC-2026-00001", venta.numeroFactura());
        assertEquals(new BigDecimal("2899900.00"), venta.total());
    }

    @Test
    @DisplayName("Debe rechazar la venta si el inventario falla")
    void debeRechazarVentaPorFalloDeInventario() {
        when(clientesClient.obtenerCliente(1L)).thenReturn(
                new ClienteClientDTO(1L, "Juan Pérez", "juan@test.com", "3001234567", "Carrera 7 # 72-10")
        );

        when(productosClient.obtenerProducto(1L)).thenReturn(
                new ProductoClientDTO(1L, "PlayStation 5", "Consola", new BigDecimal("2899900.00"), "Consolas", null, true)
        );

        when(inventarioClient.descontarStock(anyString(), anyList(), anyString()))
                .thenThrow(new VentaException("Stock insuficiente"));

        CrearVentaRequestDTO request = new CrearVentaRequestDTO(
                1L,
                "Carrera 7 # 72-10, Bogotá",
                List.of(new ItemVentaRequestDTO(1L, 100))
        );

        assertThrows(VentaException.class, () -> ventaService.procesarVenta(request));
    }

    @Test
    @DisplayName("Debe compensar inventario si la facturación falla tras haber descontado stock")
    void debeCompensarInventarioAnteFalloDeFactura() {
        when(clientesClient.obtenerCliente(1L)).thenReturn(
                new ClienteClientDTO(1L, "Juan Pérez", "juan@test.com", "3001234567", "Carrera 7 # 72-10")
        );

        when(productosClient.obtenerProducto(1L)).thenReturn(
                new ProductoClientDTO(1L, "PlayStation 5", "Consola", new BigDecimal("2899900.00"), "Consolas", null, true)
        );

        when(inventarioClient.descontarStock(anyString(), anyList(), anyString())).thenReturn(
                new ResultadoOperacionStockClientDTO("OP-1", true, "OK", 1)
        );

        // Simulamos fallo en el servicio de facturación
        when(facturacionClient.generarFactura(any(GenerarFacturaClientRequestDTO.class)))
                .thenThrow(new RuntimeException("Servicio de facturación inaccesible"));

        CrearVentaRequestDTO request = new CrearVentaRequestDTO(
                1L,
                "Carrera 7 # 72-10, Bogotá",
                List.of(new ItemVentaRequestDTO(1L, 1))
        );

        assertThrows(VentaException.class, () -> ventaService.procesarVenta(request));

        // Verificamos que se ejecutó la compensación en el inventario
        verify(inventarioClient).reponerStock(anyString(), anyString());
    }

    @Autowired
    private com.noctis.ventas.service.SolicitudTecnicaService solicitudService;

    @Autowired
    private com.noctis.ventas.service.ConversacionService conversacionService;

    @Test
    @DisplayName("Debe persistir y gestionar solicitudes técnicas con rol y cliente autenticado")
    void debeCrearYListarSolicitudTecnica() {
        var claimsCliente = new com.noctis.ventas.util.TokenUtils.TokenClaims(
                1L, "cliente@test.com", "Cliente Test", "CLIENTE", System.currentTimeMillis() / 1000 + 3600
        );

        var request = new com.noctis.ventas.dto.CrearSolicitudTecnicaDTO(
                1L, "Cliente Test", "3001234567", "cliente@test.com",
                "mantenimiento-preventivo", "consola", "PS5 Slim",
                "Sobrecalentamiento al jugar", "Bogotá"
        );

        var creada = solicitudService.crearSolicitud(request, claimsCliente);
        assertNotNull(creada);
        assertNotNull(creada.id());
        assertTrue(creada.numeroSolicitud().startsWith("ST-2026-"));
        assertEquals(com.noctis.ventas.model.EstadoSolicitud.RECIBIDA, creada.estado());

        // Cliente consulta sus solicitudes
        var listaCliente = solicitudService.listarPorCliente(1L, claimsCliente);
        assertFalse(listaCliente.isEmpty());

        // Admin actualiza estado
        var claimsAdmin = new com.noctis.ventas.util.TokenUtils.TokenClaims(
                99L, "admin@test.com", "Admin Test", "ADMIN", System.currentTimeMillis() / 1000 + 3600
        );
        var actualizada = solicitudService.actualizarEstado(
                creada.id(),
                new com.noctis.ventas.dto.ActualizarEstadoSolicitudDTO(com.noctis.ventas.model.EstadoSolicitud.EN_PROCESO),
                claimsAdmin
        );
        assertEquals(com.noctis.ventas.model.EstadoSolicitud.EN_PROCESO, actualizada.estado());
    }

    @Test
    @DisplayName("Debe gestionar ciclo de conversación contextual y mensajes en una solicitud técnica")
    void debeGestionarConversacionYMensajesContextuales() {
        var claimsCliente = new com.noctis.ventas.util.TokenUtils.TokenClaims(
                2L, "cliente2@test.com", "Cliente Dos", "CLIENTE", System.currentTimeMillis() / 1000 + 3600
        );

        var st = solicitudService.crearSolicitud(
                new com.noctis.ventas.dto.CrearSolicitudTecnicaDTO(
                        2L, "Cliente Dos", "3119876543", "cliente2@test.com",
                        "limpieza-termica", "pc", "Laptop Asus ROG", "Cambio de pasta", "Medellín"
                ),
                claimsCliente
        );

        // Inicializar canal contextual para la solicitud
        var conv = conversacionService.obtenerOInicializarPorContexto(
                com.noctis.ventas.model.TipoOrigenConversacion.SOLICITUD_TECNICA,
                st.id(),
                claimsCliente
        );
        assertNotNull(conv);
        assertEquals(com.noctis.ventas.model.EstadoConversacion.ABIERTA, conv.estado());

        // Cliente envía un mensaje
        var msgCliente = conversacionService.enviarMensaje(
                conv.id(),
                new com.noctis.ventas.dto.CrearMensajeDTO("Hola, ¿cuándo puedo llevar el equipo?"),
                claimsCliente
        );
        assertNotNull(msgCliente);
        assertEquals("CLIENTE", msgCliente.remitenteRol());

        // Admin responde
        var claimsAdmin = new com.noctis.ventas.util.TokenUtils.TokenClaims(
                99L, "admin@test.com", "Admin Soporte", "ADMIN", System.currentTimeMillis() / 1000 + 3600
        );
        var msgAdmin = conversacionService.enviarMensaje(
                conv.id(),
                new com.noctis.ventas.dto.CrearMensajeDTO("Hola, puedes traerla de 9am a 6pm."),
                claimsAdmin
        );
        assertNotNull(msgAdmin);
        assertEquals("ADMIN", msgAdmin.remitenteRol());

        // Mensajes listados
        var mensajes = conversacionService.listarMensajes(conv.id(), claimsCliente);
        assertTrue(mensajes.size() >= 3); // Bienvenida sistema + cliente + admin

        // Cerrar conversación
        var cerrada = conversacionService.cerrarConversacion(conv.id(), claimsAdmin);
        assertEquals(com.noctis.ventas.model.EstadoConversacion.CERRADA, cerrada.estado());

        // Rechazo de nuevos mensajes en conversación cerrada
        assertThrows(com.noctis.ventas.exception.BadRequestException.class, () ->
                conversacionService.enviarMensaje(conv.id(), new com.noctis.ventas.dto.CrearMensajeDTO("Test después de cierre"), claimsCliente)
        );
    }
}
