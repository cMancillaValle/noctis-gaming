package com.noctis.ventas;

import com.noctis.ventas.util.AuthorizationUtils;
import com.noctis.ventas.util.TokenUtils;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.BeforeAll;
import org.springframework.web.server.ResponseStatusException;

import static org.junit.jupiter.api.Assertions.*;

class AuthorizationUtilsTests {
    @BeforeAll static void configureSecret() {
        TokenUtils.setSecret("NoctisTestJwtSecretWithAtLeastThirtyTwoCharacters!");
    }

    @Test void restringeVentasAlPropietarioOAdministrador() {
        var owner = new TokenUtils.TokenClaims(7L, "owner@test.com", "Owner", "CLIENTE", Long.MAX_VALUE);
        assertDoesNotThrow(() -> AuthorizationUtils.requireOwnerOrAdmin(owner, 7L));
        assertThrows(ResponseStatusException.class, () -> AuthorizationUtils.requireOwnerOrAdmin(owner, 8L));
        var admin = new TokenUtils.TokenClaims(99L, "admin@test.com", "Admin", "ADMIN", Long.MAX_VALUE);
        assertDoesNotThrow(() -> AuthorizationUtils.requireOwnerOrAdmin(admin, 8L));
    }

    @Test void generaCredencialInternaCortaEIdentificada() {
        var claims = TokenUtils.validateAndExtract(TokenUtils.generateServiceToken());
        assertNotNull(claims);
        assertEquals("SERVICE", claims.rol());
        assertEquals("ventas-service", claims.email());
        assertTrue(claims.exp() - System.currentTimeMillis() / 1000 <= 300);
    }
}
