package com.noctis.facturacion.util;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Base64;
import java.util.Map;

public class TokenUtils {

    private static final Logger log = LoggerFactory.getLogger(TokenUtils.class);
    private static final String DEV_FALLBACK_SECRET = "NoctisLocalDevFallbackHmacSha256SecretKeyForTestingOnly2026!";
    private static volatile String configuredSecret = null;
    private static final ObjectMapper MAPPER = new ObjectMapper();

    public record TokenClaims(Long id, String email, String nombre, String rol, long exp) {}

    public static synchronized void setSecret(String secret) {
        if (secret != null && !secret.isBlank()) {
            configuredSecret = secret.trim();
        }
    }

    public static String getSecret() {
        if (configuredSecret != null && !configuredSecret.isBlank()) {
            return configuredSecret;
        }

        String envSecret = System.getenv("JWT_SECRET");
        if (envSecret != null && !envSecret.isBlank()) {
            return envSecret.trim();
        }

        String propSecret = System.getProperty("security.jwt.secret");
        if (propSecret != null && !propSecret.isBlank()) {
            return propSecret.trim();
        }

        String activeProfiles = System.getProperty("spring.profiles.active");
        if (activeProfiles == null) {
            activeProfiles = System.getenv("SPRING_PROFILES_ACTIVE");
        }
        if (activeProfiles != null && activeProfiles.contains("prod")) {
            throw new IllegalStateException("JWT_SECRET no configurado. En perfil de producción (prod) se requiere obligatoriamente una clave segura.");
        }

        return DEV_FALLBACK_SECRET;
    }

    public static TokenClaims validateAndExtract(String token) {
        if (token == null || !token.contains(".")) {
            return null;
        }
        if (token.startsWith("Bearer ")) {
            token = token.substring(7).trim();
        }

        String[] parts = token.split("\\.");
        if (parts.length != 3) {
            return null;
        }

        String data = parts[0] + "." + parts[1];
        String expectedSig = sign(data);
        if (!expectedSig.equals(parts[2])) {
            return null;
        }

        try {
            byte[] payloadBytes = Base64.getUrlDecoder().decode(parts[1]);
            @SuppressWarnings("unchecked")
            Map<String, Object> claims = MAPPER.readValue(payloadBytes, Map.class);

            long exp = ((Number) claims.get("exp")).longValue();
            if (Instant.now().getEpochSecond() > exp) {
                return null;
            }

            Long id = ((Number) claims.get("id")).longValue();
            String email = (String) claims.get("email");
            String nombre = (String) claims.get("nombre");
            String rol = (String) claims.get("rol");

            return new TokenClaims(id, email, nombre, rol, exp);
        } catch (Exception e) {
            return null;
        }
    }

    private static String sign(String data) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(getSecret().getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            byte[] rawHmac = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            return Base64.getUrlEncoder().withoutPadding().encodeToString(rawHmac);
        } catch (Exception e) {
            throw new RuntimeException("Error al verificar firma de token", e);
        }
    }
}
