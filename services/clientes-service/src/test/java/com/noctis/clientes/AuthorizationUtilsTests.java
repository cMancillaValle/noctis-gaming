package com.noctis.clientes;

import com.noctis.clientes.util.AuthorizationUtils;
import com.noctis.clientes.util.TokenUtils;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.springframework.web.server.ResponseStatusException;

import static org.junit.jupiter.api.Assertions.*;

class AuthorizationUtilsTests {
    private static final String SECRET = "NoctisTestJwtSecretWithAtLeastThirtyTwoCharacters!";

    @BeforeAll static void configureSecret() { TokenUtils.setSecret(SECRET); }

    @Test void protegeDatosPrivadosPorPropietarioRolYServicio() {
        assertThrows(ResponseStatusException.class, () -> AuthorizationUtils.requireAuthenticated(null));
        var owner = AuthorizationUtils.requireAuthenticated("Bearer " + TokenUtils.generateToken(7L, "owner@test.com", "Owner", "CLIENTE"));
        assertDoesNotThrow(() -> AuthorizationUtils.requireOwnerAdminOrVentasService(owner, 7L));
        assertThrows(ResponseStatusException.class, () -> AuthorizationUtils.requireOwnerAdminOrVentasService(owner, 8L));
        var admin = AuthorizationUtils.requireAuthenticated("Bearer " + TokenUtils.generateToken(99L, "admin@test.com", "Admin", "ADMIN"));
        assertDoesNotThrow(() -> AuthorizationUtils.requireOwnerAdminOrVentasService(admin, 8L));
    }
}
