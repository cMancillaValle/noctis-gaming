package com.noctis.productos.config;

import com.noctis.productos.model.Producto;
import com.noctis.productos.repository.ProductoRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);
    private final ProductoRepository productoRepository;

    public DataInitializer(ProductoRepository productoRepository) {
        this.productoRepository = productoRepository;
    }

    @Override
    public void run(String... args) {
        if (productoRepository.count() == 0) {
            log.info("Inicializando catálogo de productos gamer en Noctis Gaming...");

            List<Producto> catalogo = List.of(
                    new Producto(null, "PlayStation 5 Slim 1TB Digital",
                            "Consola de última generación ultracompacta con SSD de alta velocidad de 1TB, audio 3D Tempest y retroalimentación háptica.",
                            new BigDecimal("2899900.00"), "Consolas", "/images/products/ps5-slim.png", true, LocalDateTime.now()),

                    new Producto(null, "Xbox Series X 1TB Black",
                            "La consola Xbox más potente con arquitectura Velocity, 12 teraflops de procesamiento gráfico y compatibilidad 4K a 120 FPS.",
                            new BigDecimal("3299900.00"), "Consolas", "/images/products/xbox-series-x.png", true, LocalDateTime.now()),

                    new Producto(null, "Nintendo Switch OLED Mario Red Edition",
                            "Pantalla OLED vibrante de 7 pulgadas, soporte ajustable amplio, base con puerto LAN con cable y 64 GB de almacenamiento interno.",
                            new BigDecimal("1849900.00"), "Consolas", "/images/products/switch-oled.png", true, LocalDateTime.now()),

                    new Producto(null, "Control Inalámbrico DualSense Edge PS5",
                            "Control ultra personalizable con perfiles intercambiables, módulos de palanca reemplazables y gatillos ajustables.",
                            new BigDecimal("1149900.00"), "Controles", "/images/products/dualsense-edge.png", true, LocalDateTime.now()),

                    new Producto(null, "Control Inalámbrico Xbox Elite Series 2 Core",
                            "Palancas de mando con tensión ajustable, empuñadura de goma envolvente y bloqueos de gatillos de alta sensibilidad.",
                            new BigDecimal("799900.00"), "Controles", "/images/products/xbox-elite.png", true, LocalDateTime.now()),

                    new Producto(null, "Mouse Gamer Logitech G Pro X Superlight 2",
                            "Sensor HERO 2 con 32.000 DPI, switches híbridos LIGHTFORCE óptico-mecánicos y peso ultraligero de 60 gramos.",
                            new BigDecimal("689900.00"), "Periféricos", "/images/products/logitech-gpro.png", true, LocalDateTime.now()),

                    new Producto(null, "Teclado Mecánico Razer Huntsman V3 Pro",
                            "Switches analógicos ópticos Gen-2 de Razer con accionamiento rápido ajustable y modo Rapid Trigger.",
                            new BigDecimal("1099900.00"), "Periféricos", "/images/products/razer-huntsman.png", true, LocalDateTime.now()),

                    new Producto(null, "Headset Gamer Inalámbrico Astro A50 X",
                            "Tecnología PLAYSYNC HDMI 2.1, transductores de grafeno de 40 mm y audio inalámbrico profesional de 24 bits.",
                            new BigDecimal("1649900.00"), "Periféricos", "/images/products/astro-a50x.png", true, LocalDateTime.now()),

                    new Producto(null, "The Legend of Zelda: Tears of the Kingdom",
                            "Aventura épica por tierra y cielos de Hyrule con mecánicas creativas de fusión y construcción sin precedentes.",
                            new BigDecimal("279900.00"), "Videojuegos", "/images/products/zelda-totk.png", true, LocalDateTime.now()),

                    new Producto(null, "God of War Ragnarök PS5",
                            "Kratos y Atreus deben viajar a cada uno de los Nueve Reinos en busca de respuestas mientras las fuerzas asgardianas se preparan para la guerra.",
                            new BigDecimal("259900.00"), "Videojuegos", "/images/products/gow-ragnarok.png", true, LocalDateTime.now()),

                    new Producto(null, "EA SPORTS FC 25 Standard Edition",
                            "El juego de todos con tecnología HyperMotionV, PlayStyles optimizados por Opta y Frostbite Engine renovado.",
                            new BigDecimal("289900.00"), "Videojuegos", "/images/products/ea-fc25.png", true, LocalDateTime.now()),

                    new Producto(null, "Soporte Noctis RGB Pro con Hub USB 3.0",
                            "Base metálica para auriculares con iluminación RGB dinámica personalizable y concentrador de 3 puertos USB 3.0 frontales.",
                            new BigDecimal("149900.00"), "Accesorios", "/images/products/soporte-rgb.png", true, LocalDateTime.now())
            );

            productoRepository.saveAll(catalogo);
            log.info("Catálogo gamer inicializado con {} productos en PostgreSQL.", catalogo.size());
        }
    }
}
