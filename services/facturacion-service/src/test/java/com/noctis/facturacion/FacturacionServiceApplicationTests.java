package com.noctis.facturacion;

import com.noctis.facturacion.dto.FacturaResponseDTO;
import com.noctis.facturacion.dto.GenerarFacturaRequestDTO;
import com.noctis.facturacion.dto.ItemFacturaDTO;
import com.noctis.facturacion.service.FacturaService;
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
class FacturacionServiceApplicationTests {

    @Autowired
    private FacturaService facturaService;

    @Test
    @DisplayName("Contexto de facturación carga correctamente")
    void contextLoads() {
        assertNotNull(facturaService);
    }

    @Test
    @DisplayName("Debe generar una factura con cálculos correctos de IVA e impuestos")
    void debeGenerarFactura() {
        GenerarFacturaRequestDTO request = new GenerarFacturaRequestDTO(
                101L,
                1L,
                "Sebastián Mora",
                "smora@noctisgaming.co",
                "Cra 15 # 85-30, Bogotá",
                List.of(
                        new ItemFacturaDTO(1L, "PlayStation 5 Slim", 1, new BigDecimal("2899900.00"))
                ),
                new BigDecimal("2899900.00")
        );

        FacturaResponseDTO factura = facturaService.generarFactura(request);

        assertNotNull(factura.id());
        assertNotNull(factura.numeroFactura());
        assertTrue(factura.numeroFactura().startsWith("FAC-2026-"));
        assertEquals(new BigDecimal("2899900.00"), factura.total());
        assertNotNull(factura.subtotal());
        assertNotNull(factura.impuestos());
        assertEquals(1, factura.items().size());

        // Idempotencia: si se solicita de nuevo para la misma ventaId, devuelve la misma factura sin duplicar
        FacturaResponseDTO facturaReiterada = facturaService.generarFactura(request);
        assertEquals(factura.id(), facturaReiterada.id());
        assertEquals(factura.numeroFactura(), facturaReiterada.numeroFactura());
    }
}
