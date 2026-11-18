package com.noctis.clientes.config;

import com.noctis.clientes.model.Cliente;
import com.noctis.clientes.repository.ClienteRepository;
import com.noctis.clientes.util.SecurityUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.Arrays;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);
    private final ClienteRepository clienteRepository;
    private final Environment environment;

    @Value("${noctis.seed.enabled:true}")
    private boolean seedEnabled;

    @Value("${noctis.admin.initial-password:}")
    private String initialAdminPassword;

    @Value("${noctis.seed.demo-password:}")
    private String demoPassword;

    public DataInitializer(ClienteRepository clienteRepository, Environment environment) {
        this.clienteRepository = clienteRepository;
        this.environment = environment;
    }

    @Override
    public void run(String... args) {
        // Restringir semillas y demostración: NUNCA sembrar usuarios demo en perfil prod.
        // La evolución del esquema es responsabilidad exclusiva de Flyway.
        boolean isProd = Arrays.asList(environment.getActiveProfiles()).contains("prod");
        if (isProd) {
            log.info("Perfil de producción detectado: se omite la creación automática de usuarios de demostración.");
            // Si en producción se proporcionó explícitamente ADMIN_INITIAL_PASSWORD y no existe el admin, crearlo
            if (initialAdminPassword != null && !initialAdminPassword.isBlank() && !clienteRepository.existsByEmail("admin@noctisgaming.co")) {
                log.info("Inicializando administrador de producción con credenciales seguras configuradas...");
                Cliente admin = new Cliente();
                admin.setNombre("Administrador Noctis");
                admin.setEmail("admin@noctisgaming.co");
                admin.setTelefono("+57 300 999 8888");
                admin.setDireccion("Sede Noctis Central, Bogotá");
                admin.setPasswordHash(SecurityUtils.hashPassword(initialAdminPassword));
                admin.setRol("ADMIN");
                admin.setFechaRegistro(LocalDateTime.now());
                clienteRepository.save(admin);
            }
            return;
        }

        if (!seedEnabled) {
            log.info("Semillero desactivado (noctis.seed.enabled=false). Se omite carga de datos iniciales.");
            return;
        }

        // Inicializar Administrador en entorno local / desarrollo
        if (!clienteRepository.existsByEmail("admin@noctisgaming.co")) {
            log.info("Inicializando usuario administrador de desarrollo local...");
            String adminPass = (initialAdminPassword != null && !initialAdminPassword.isBlank())
                    ? initialAdminPassword
                    : "DevAdminSecure2026!";
            Cliente admin = new Cliente();
            admin.setNombre("Administrador Noctis");
            admin.setEmail("admin@noctisgaming.co");
            admin.setTelefono("+57 300 999 8888");
            admin.setDireccion("Sede Noctis Central, Bogotá");
            admin.setPasswordHash(SecurityUtils.hashPassword(adminPass));
            admin.setRol("ADMIN");
            admin.setFechaRegistro(LocalDateTime.now());
            clienteRepository.save(admin);
        }

        // Inicializar clientes demo para pruebas locales si no existen
        String clientPass = (demoPassword != null && !demoPassword.isBlank())
                ? demoPassword
                : "DevClientSecure2026!";

        if (!clienteRepository.existsByEmail("smora@noctisgaming.co")) {
            log.info("Inicializando cliente demo local 1...");
            Cliente demoCliente1 = new Cliente();
            demoCliente1.setNombre("Sebastián Mora");
            demoCliente1.setEmail("smora@noctisgaming.co");
            demoCliente1.setTelefono("+57 310 456 7890");
            demoCliente1.setDireccion("Cra 15 # 85-30, Chapinero, Bogotá");
            demoCliente1.setPasswordHash(SecurityUtils.hashPassword(clientPass));
            demoCliente1.setRol("CLIENTE");
            demoCliente1.setFechaRegistro(LocalDateTime.now());
            clienteRepository.save(demoCliente1);
        }

        if (!clienteRepository.existsByEmail("valeria.gamer@gmail.com")) {
            log.info("Inicializando cliente demo local 2...");
            Cliente demoCliente2 = new Cliente();
            demoCliente2.setNombre("Valeria Restrepo");
            demoCliente2.setEmail("valeria.gamer@gmail.com");
            demoCliente2.setTelefono("+57 301 987 6543");
            demoCliente2.setDireccion("Calle 10 # 43E-20, El Poblado, Medellín");
            demoCliente2.setPasswordHash(SecurityUtils.hashPassword(clientPass));
            demoCliente2.setRol("CLIENTE");
            demoCliente2.setFechaRegistro(LocalDateTime.now());
            clienteRepository.save(demoCliente2);
        }
    }
}
