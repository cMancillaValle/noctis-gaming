package com.noctis.ventas.client;

import com.noctis.ventas.client.dto.ClienteClientDTO;
import com.noctis.ventas.exception.VentaException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import com.noctis.ventas.util.TokenUtils;

@Component
public class ClientesClient {

    private static final Logger log = LoggerFactory.getLogger(ClientesClient.class);
    private final RestClient restClient;

    public ClientesClient(RestClient.Builder restClientBuilder,
                          @Value("${services.clientes.url:http://localhost:8081}") String clientesServiceUrl) {
        this.restClient = restClientBuilder.baseUrl(clientesServiceUrl).build();
    }

    public ClienteClientDTO obtenerCliente(Long clienteId) {
        try {
            return restClient.get()
                    .uri("/api/clientes/{id}", clienteId)
                    .header("Authorization", "Bearer " + TokenUtils.generateServiceToken())
                    .retrieve()
                    .body(ClienteClientDTO.class);
        } catch (Exception ex) {
            log.error("Error al consultar clientes-service para ID: {}", clienteId, ex);
            throw new VentaException("No fue posible validar el cliente con ID " + clienteId + ": " + ex.getMessage());
        }
    }
}
