package com.noctis.ventas.config;

import com.noctis.ventas.util.TokenUtils;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;

import java.util.Arrays;

@Component
public class JwtConfig {

    private static final Logger log = LoggerFactory.getLogger(JwtConfig.class);

    @Value("${security.jwt.secret:}")
    private String jwtSecret;

    private final Environment environment;

    public JwtConfig(Environment environment) {
        this.environment = environment;
    }

    @PostConstruct
    public void init() {
        boolean isProd = Arrays.asList(environment.getActiveProfiles()).contains("prod");

        if (jwtSecret != null && !jwtSecret.isBlank()) {
            if (isProd && jwtSecret.length() < 32) {
                throw new IllegalStateException("JWT_SECRET inseguro: debe contener al menos 32 caracteres (256 bits) en perfil de producción.");
            }
            TokenUtils.setSecret(jwtSecret);
            log.info("Clave JWT configurada exitosamente desde configuración de aplicación.");
        } else if (isProd) {
            throw new IllegalStateException("JWT_SECRET no configurado: se requiere un secreto seguro en perfil de producción.");
        } else {
            log.warn("ADVERTENCIA DE SEGURIDAD: JWT_SECRET no configurado explícitamente. Se empleará clave de desarrollo local.");
        }
    }
}
