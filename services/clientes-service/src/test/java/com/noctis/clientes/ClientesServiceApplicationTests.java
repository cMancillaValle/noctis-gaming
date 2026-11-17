package com.noctis.clientes;

import com.noctis.clientes.dto.*;
import com.noctis.clientes.exception.BadRequestException;
import com.noctis.clientes.service.ClienteService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
class ClientesServiceApplicationTests {

    @Autowired
    private ClienteService clienteService;

    @Test
    @DisplayName("Contexto carga correctamente")
    void contextLoads() {
        assertNotNull(clienteService);
    }

    @Test
    @DisplayName("Debe registrar un nuevo cliente con contraseña obligatoria BCrypt")
    void debeRegistrarCliente() {
        ClienteRequestDTO request = new ClienteRequestDTO(
                "Carlos Gómez",
                "carlos.gomez@test.com",
                "+57 320 111 2233",
                "Calle 100 # 15-20, Bogotá",
                "PasswordSegura123!"
        );

        ClienteResponseDTO response = clienteService.registrar(request);

        assertNotNull(response.id());
        assertEquals("Carlos Gómez", response.nombre());
        assertEquals("carlos.gomez@test.com", response.email());
        assertEquals("+57 320 111 2233", response.telefono());
        assertEquals("CLIENTE", response.rol());
    }

    @Test
    @DisplayName("Debe rechazar el registro de un cliente con contraseña vacía o demasiado corta")
    void debeRechazarPasswordCorta() {
        ClienteRequestDTO requestInvalido = new ClienteRequestDTO(
                "Usuario Invalido",
                "invalido@test.com",
                "+57 300 123 0000",
                "Calle 1",
                "123"
        );

        assertThrows(BadRequestException.class, () -> clienteService.registrar(requestInvalido));
    }

    @Test
    @DisplayName("Debe autenticar y generar token firmado")
    void debeAutenticarYGenerarToken() {
        ClienteRequestDTO reg = new ClienteRequestDTO(
                "Ana Login",
                "ana.login@test.com",
                "+57 300 444 5555",
                "Calle 50 # 10-20",
                "ClaveSecreta2026!"
        );
        clienteService.registrar(reg);

        LoginResponseDTO loginResponse = clienteService.autenticar(
                new ClienteLoginDTO("ana.login@test.com", "ClaveSecreta2026!")
        );

        assertNotNull(loginResponse);
        assertNotNull(loginResponse.token());
        assertEquals("Ana Login", loginResponse.cliente().nombre());
    }

    @Test
    @DisplayName("Debe rechazar el registro de un cliente con correo duplicado")
    void debeRechazarCorreoDuplicado() {
        ClienteRequestDTO request1 = new ClienteRequestDTO(
                "Cliente Original",
                "duplicado@test.com",
                "+57 300 000 0001",
                "Direccion 1",
                "Pass12345!"
        );
        clienteService.registrar(request1);

        ClienteRequestDTO request2 = new ClienteRequestDTO(
                "Cliente Duplicado",
                "duplicado@test.com",
                "+57 300 000 0002",
                "Direccion 2",
                "Pass12345!"
        );

        assertThrows(RuntimeException.class, () -> clienteService.registrar(request2));
    }
}
