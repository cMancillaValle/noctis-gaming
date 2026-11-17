package com.noctis.productos;

import com.noctis.productos.dto.ActualizarPrecioDTO;
import com.noctis.productos.dto.ProductoRequestDTO;
import com.noctis.productos.dto.ProductoResponseDTO;
import com.noctis.productos.dto.ProductoUpdateDTO;
import com.noctis.productos.service.ProductoService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import java.math.BigDecimal;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
class ProductosServiceApplicationTests {

    @Autowired
    private ProductoService productoService;

    @Test
    @DisplayName("Contexto de productos carga correctamente")
    void contextLoads() {
        assertNotNull(productoService);
    }

    @Test
    @DisplayName("Debe listar productos inicializados")
    void debeListarProductos() {
        List<ProductoResponseDTO> productos = productoService.listarProductos(null, null);
        assertNotNull(productos);
        assertFalse(productos.isEmpty());
    }

    @Test
    @DisplayName("Debe crear un producto y actualizar su precio")
    void debeCrearYActualizarPrecio() {
        ProductoRequestDTO request = new ProductoRequestDTO(
                "Monitor Gamer 240Hz",
                "Monitor IPS 1ms QHD 27 pulgadas",
                new BigDecimal("1500000.00"),
                "Periféricos",
                "/images/products/monitor.png"
        );

        ProductoResponseDTO creado = productoService.crearProducto(request);
        assertNotNull(creado.id());
        assertEquals("Monitor Gamer 240Hz", creado.nombre());

        ActualizarPrecioDTO updatePrecio = new ActualizarPrecioDTO(new BigDecimal("1420000.00"));
        ProductoResponseDTO actualizado = productoService.actualizarPrecio(creado.id(), updatePrecio);

        assertEquals(new BigDecimal("1420000.00"), actualizado.precio());
    }

    @Test
    @DisplayName("Debe permitir la edición completa de un producto comercial existente")
    void debePermitirEdicionCompletaDeProducto() {
        ProductoRequestDTO request = new ProductoRequestDTO(
                "Headset Original Noctis",
                "Audio envolvente 7.1 estéreo",
                new BigDecimal("299900.00"),
                "Periféricos",
                "/images/products/headset.png"
        );
        ProductoResponseDTO creado = productoService.crearProducto(request);

        ProductoUpdateDTO edicion = new ProductoUpdateDTO(
                "Headset Noctis Pro Wireless V2",
                "Audio espacial THX 7.1 con drivers de titanio de 50mm",
                new BigDecimal("349900.00"),
                "Periféricos",
                "/images/products/headset-v2.png",
                true
        );

        ProductoResponseDTO modificado = productoService.actualizarProductoCompleto(creado.id(), edicion);

        assertNotNull(modificado);
        assertEquals("Headset Noctis Pro Wireless V2", modificado.nombre());
        assertEquals("Audio espacial THX 7.1 con drivers de titanio de 50mm", modificado.descripcion());
        assertEquals(new BigDecimal("349900.00"), modificado.precio());
        assertEquals("/images/products/headset-v2.png", modificado.imagenUrl());
        assertTrue(modificado.activo());
    }
}
