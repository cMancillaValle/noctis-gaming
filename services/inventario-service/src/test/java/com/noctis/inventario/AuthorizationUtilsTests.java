package com.noctis.inventario;

import com.noctis.inventario.util.AuthorizationUtils;
import com.noctis.inventario.util.TokenUtils;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.springframework.web.server.ResponseStatusException;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Base64;

import static org.junit.jupiter.api.Assertions.*;

class AuthorizationUtilsTests {
    private static final String SECRET = "NoctisTestJwtSecretWithAtLeastThirtyTwoCharacters!";

    @BeforeAll static void configureSecret() { TokenUtils.setSecret(SECRET); }

    @Test void soloVentasServicePuedeMutarStock() {
        assertThrows(ResponseStatusException.class, () -> AuthorizationUtils.requireVentasService(null));
        assertThrows(ResponseStatusException.class, () -> AuthorizationUtils.requireVentasService(token(1, "cliente@test.com", "CLIENTE")));
        assertDoesNotThrow(() -> AuthorizationUtils.requireVentasService(token(0, "ventas-service", "SERVICE")));
    }

    @Test void consultasAdministrativasRequierenAdmin() {
        assertThrows(ResponseStatusException.class, () -> AuthorizationUtils.requireAdmin(token(1, "cliente@test.com", "CLIENTE")));
        assertDoesNotThrow(() -> AuthorizationUtils.requireAdmin(token(99, "admin@test.com", "ADMIN")));
    }

    private static String token(long id, String email, String role) {
        try {
            String header = Base64.getUrlEncoder().withoutPadding().encodeToString("{\"alg\":\"HS256\",\"typ\":\"JWT\"}".getBytes(StandardCharsets.UTF_8));
            String json = "{\"id\":" + id + ",\"email\":\"" + email + "\",\"nombre\":\"Test\",\"rol\":\"" + role + "\",\"exp\":" + (Instant.now().getEpochSecond() + 300) + "}";
            String payload = Base64.getUrlEncoder().withoutPadding().encodeToString(json.getBytes(StandardCharsets.UTF_8));
            String data = header + "." + payload;
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(SECRET.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            return "Bearer " + data + "." + Base64.getUrlEncoder().withoutPadding().encodeToString(mac.doFinal(data.getBytes(StandardCharsets.UTF_8)));
        } catch (Exception e) { throw new IllegalStateException(e); }
    }
}
