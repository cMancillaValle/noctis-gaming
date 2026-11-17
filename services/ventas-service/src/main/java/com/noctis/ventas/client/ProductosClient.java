package com.noctis.ventas.client;

import com.noctis.ventas.client.dto.ProductoClientDTO;
import com.noctis.ventas.exception.VentaException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

@Component
public class ProductosClient {

    private static final Logger log = LoggerFactory.getLogger(ProductosClient.class);
    private final RestClient restClient;

    public ProductosClient(RestClient.Builder restClientBuilder,
                           @Value("${services.productos.url:http://localhost:8082}") String productosServiceUrl) {
        this.restClient = restClientBuilder.baseUrl(productosServiceUrl).build();
    }

    public ProductoClientDTO obtenerProducto(Long productoId) {
        try {
            return restClient.get()
                    .uri("/api/productos/{id}", productoId)
                    .retrieve()
                    .body(ProductoClientDTO.class);
        } catch (Exception ex) {
            log.error("Error al consultar productos-service para ID: {}", productoId, ex);
            throw new VentaException("Producto con ID " + productoId + " no disponible o no encontrado: " + ex.getMessage());
        }
    }
}
