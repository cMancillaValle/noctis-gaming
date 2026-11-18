package com.noctis.inventario.config;

import com.noctis.inventario.model.InventarioItem;
import com.noctis.inventario.repository.InventarioItemRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Component
@ConditionalOnProperty(name = "noctis.seed.enabled", havingValue = "true", matchIfMissing = true)
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);
    private final InventarioItemRepository itemRepository;

    public DataInitializer(InventarioItemRepository itemRepository) {
        this.itemRepository = itemRepository;
    }

    @Override
    public void run(String... args) {
        log.info("Verificando existencias iniciales de inventario en Noctis Gaming...");

        List<InventarioItem> stockInicial = List.of(
                new InventarioItem(null, 1L, 15, 0, "BODEGA-BOGOTA-A1", LocalDateTime.now()),
                new InventarioItem(null, 2L, 12, 0, "BODEGA-BOGOTA-A2", LocalDateTime.now()),
                new InventarioItem(null, 3L, 20, 0, "BODEGA-BOGOTA-A3", LocalDateTime.now()),
                new InventarioItem(null, 4L, 25, 0, "BODEGA-BOGOTA-B1", LocalDateTime.now()),
                new InventarioItem(null, 5L, 18, 0, "BODEGA-BOGOTA-B2", LocalDateTime.now()),
                new InventarioItem(null, 6L, 30, 0, "BODEGA-BOGOTA-C1", LocalDateTime.now()),
                new InventarioItem(null, 7L, 22, 0, "BODEGA-BOGOTA-C2", LocalDateTime.now()),
                new InventarioItem(null, 8L, 14, 0, "BODEGA-BOGOTA-C3", LocalDateTime.now()),
                new InventarioItem(null, 9L, 45, 0, "BODEGA-BOGOTA-D1", LocalDateTime.now()),
                new InventarioItem(null, 10L, 50, 0, "BODEGA-BOGOTA-D2", LocalDateTime.now()),
                new InventarioItem(null, 11L, 60, 0, "BODEGA-BOGOTA-D3", LocalDateTime.now()),
                new InventarioItem(null, 12L, 40, 0, "BODEGA-BOGOTA-E1", LocalDateTime.now())
        );

        int insertados = 0;
        for (InventarioItem item : stockInicial) {
            if (!itemRepository.existsByProductoId(item.getProductoId())) {
                itemRepository.save(item);
                insertados++;
            }
        }

        if (insertados > 0) {
            log.info("Inventario inicial cargado exitosamente: {} existencias registradas en PostgreSQL.", insertados);
        } else {
            log.info("Inventario de productos ya presente. No se insertaron existencias duplicadas.");
        }
    }
}
