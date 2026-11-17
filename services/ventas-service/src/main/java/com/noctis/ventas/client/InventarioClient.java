package com.noctis.ventas.client;

import com.noctis.ventas.client.dto.*;
import com.noctis.ventas.exception.VentaException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.List;

@Component
public class InventarioClient {

    private static final Logger log = LoggerFactory.getLogger(InventarioClient.class);
    private final RestClient restClient;

    public InventarioClient(RestClient.Builder restClientBuilder,
                            @Value("${services.inventario.url:http://localhost:8083}") String inventarioServiceUrl) {
        this.restClient = restClientBuilder.baseUrl(inventarioServiceUrl).build();
    }

    public ResultadoOperacionStockClientDTO descontarStock(String operacionId, List<ItemDescuentoClientDTO> items, String referencia) {
        try {
            DescontarStockClientRequestDTO request = new DescontarStockClientRequestDTO(operacionId, items, referencia);
            return restClient.post()
                    .uri("/api/inventario/descontar")
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(request)
                    .retrieve()
                    .body(ResultadoOperacionStockClientDTO.class);
        } catch (Exception ex) {
            log.error("Error al descontar stock en inventario para operacionId: {}", operacionId, ex);
            throw new VentaException("No fue posible reservar existencias en el inventario: " + ex.getMessage());
        }
    }

    public ResultadoOperacionStockClientDTO reponerStock(String operacionId, String motivo) {
        try {
            ReponerStockClientRequestDTO request = new ReponerStockClientRequestDTO(operacionId, motivo);
            return restClient.post()
                    .uri("/api/inventario/reponer")
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(request)
                    .retrieve()
                    .body(ResultadoOperacionStockClientDTO.class);
        } catch (Exception ex) {
            log.error("Fallo crítico al compensar inventario para operacionId: {}", operacionId, ex);
            return new ResultadoOperacionStockClientDTO(operacionId, false, ex.getMessage(), 0);
        }
    }
}
