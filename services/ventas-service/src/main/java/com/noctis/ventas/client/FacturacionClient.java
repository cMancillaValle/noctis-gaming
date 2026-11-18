package com.noctis.ventas.client;

import com.noctis.ventas.client.dto.FacturaClientResponseDTO;
import com.noctis.ventas.client.dto.GenerarFacturaClientRequestDTO;
import com.noctis.ventas.exception.VentaException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import com.noctis.ventas.util.TokenUtils;

@Component
public class FacturacionClient {

    private static final Logger log = LoggerFactory.getLogger(FacturacionClient.class);
    private final RestClient restClient;

    public FacturacionClient(RestClient.Builder restClientBuilder,
                             @Value("${services.facturacion.url:http://localhost:8085}") String facturacionServiceUrl) {
        this.restClient = restClientBuilder.baseUrl(facturacionServiceUrl).build();
    }

    public FacturaClientResponseDTO generarFactura(GenerarFacturaClientRequestDTO request) {
        try {
            return restClient.post()
                    .uri("/api/facturas")
                    .header("Authorization", "Bearer " + TokenUtils.generateServiceToken())
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(request)
                    .retrieve()
                    .body(FacturaClientResponseDTO.class);
        } catch (Exception ex) {
            log.error("Error al emitir factura en facturacion-service para venta ID: {}", request.ventaId(), ex);
            throw new VentaException("Error al generar la factura en el microservicio correspondiente: " + ex.getMessage());
        }
    }
}
