package com.noctis.inventario.util;

import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

public final class AuthorizationUtils {
    private AuthorizationUtils() {}

    public static TokenUtils.TokenClaims requireAuthenticated(String authorization) {
        TokenUtils.TokenClaims claims = TokenUtils.validateAndExtract(authorization);
        if (claims == null) throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Autenticación requerida");
        return claims;
    }

    public static void requireAdmin(String authorization) {
        if (!"ADMIN".equalsIgnoreCase(requireAuthenticated(authorization).rol())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Se requieren privilegios de administrador");
        }
    }

    public static void requireVentasService(String authorization) {
        TokenUtils.TokenClaims claims = requireAuthenticated(authorization);
        if (!"SERVICE".equalsIgnoreCase(claims.rol()) || !"ventas-service".equals(claims.email())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Endpoint exclusivo de ventas-service");
        }
    }
}
