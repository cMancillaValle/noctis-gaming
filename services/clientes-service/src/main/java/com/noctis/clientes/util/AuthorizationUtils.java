package com.noctis.clientes.util;

import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

public final class AuthorizationUtils {

    private AuthorizationUtils() {}

    public static TokenUtils.TokenClaims requireAuthenticated(String authorization) {
        TokenUtils.TokenClaims claims = TokenUtils.validateAndExtract(authorization);
        if (claims == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Autenticación requerida");
        }
        return claims;
    }

    public static void requireAdmin(TokenUtils.TokenClaims claims) {
        if (!"ADMIN".equalsIgnoreCase(claims.rol())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Se requieren privilegios de administrador");
        }
    }

    public static void requireOwnerAdminOrVentasService(TokenUtils.TokenClaims claims, Long clienteId) {
        boolean owner = claims.id().equals(clienteId);
        boolean admin = "ADMIN".equalsIgnoreCase(claims.rol());
        boolean ventasService = "SERVICE".equalsIgnoreCase(claims.rol())
                && "ventas-service".equals(claims.email());
        if (!owner && !admin && !ventasService) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "No puedes consultar información de otro cliente");
        }
    }

    public static void requireOwnerOrAdmin(TokenUtils.TokenClaims claims, Long clienteId) {
        if (!claims.id().equals(clienteId) && !"ADMIN".equalsIgnoreCase(claims.rol())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "No puedes modificar información de otro cliente");
        }
    }
}
