# Noctis Gaming 🎮

Plataforma integral de comercio electrónico para la comunidad gamer en Colombia, desarrollada bajo una **arquitectura de microservicios con Spring Boot y Java 21**, interfaz moderna con **React, TypeScript y Tailwind CSS**, contenedorización con **Docker Compose** y preparación empresarial para **Microsoft Azure (Azure DevOps, ACR, AKS, Key Vault y Azure Monitor)**.

---

## 1. Identidad Visual y Marca

La plataforma implementa la identidad visual oficial definida en los recursos de marca (`docs/references/`):

- **Fondo principal:** `#0B0F1A`
- **Morado de marca:** `#7C3AED`
- **Cian de interacción:** `#22D3EE`
- **Texto principal:** `#F5F7FF`
- **Superficies secundarias:** `#334155`
- **Tipografías unificadas:**
  - **Poppins:** Títulos, encabezados y elementos principales.
  - **Inter (`font-sans`):** Párrafos, tablas, campos de formulario, botones, etiquetas y valores numéricos/precios.
- **Recursos utilizados:** Imagotipo y favicon oficiales conservados intactos en `public/`.
- **Componentes flotantes:** Nuevo control desplegable accesible `CustomSelect` con bordes redondeados, paleta oscura, soporte completo para teclado (Enter, Escape, Flechas) y cierre al hacer clic afuera.

---

## 2. Automatización con Scripts BAT (Windows)

El proyecto incluye scripts en formato `.bat` ubicados en la raíz para operar el entorno Docker local de forma rápida, segura y sin riesgo de pérdida de datos:

### 2.1. `iniciar-noctis.bat` (Arranque Rápido)
- Verifica la disponibilidad del motor Docker antes de iniciar.
- Ejecuta `docker compose up -d` **sin recompilar (`--no-build`)**, reutilizando las imágenes existentes para un encendido casi instantáneo.
- Realiza polling automático consultando el puerto `3000`.
- Abre el navegador predeterminado en `http://localhost:3000` en cuanto la tienda está lista.

### 2.2. `detener-noctis.bat` (Detención Segura & Persistencia)
- Detiene los contenedores de forma ordenada mediante `docker compose stop`.
- **Garantía de Persistencia:** No destruye contenedores ni volúmenes (`docker compose down -v` está estrictamente evitado).
- Todas las cuentas de clientes, compras registradas, stock y facturas en PostgreSQL permanecen intactas en el volumen `postgres_data`.

### 2.3. `actualizar-noctis.bat` (Recompilación Selectiva)
Permite recompilar y reiniciar exclusivamente el componente que haya sufrido modificaciones de código sin necesidad de reconstruir toda la plataforma:
- Menú interactivo:
  1. **Frontend** (`frontend`)
  2. **Clientes** (`clientes-service`)
  3. **Productos** (`productos-service`)
  4. **Inventario** (`inventario-service`)
  5. **Ventas** (`ventas-service`)
  6. **Facturación** (`facturacion-service`)
  7. **Todos los servicios** (Recompilar y reiniciar plataforma completa)
  8. **Salir sin cambios**

---

## 3. Seguridad, Variables de Entorno y Configuración

El proyecto aplica el principio de **cero secretos incrustados en el código fuente** para permitir su publicación segura en repositorios públicos.

### 3.1. Configuración de Entorno Local (.env)

Para ejecutar la plataforma localmente:
1. Copia el archivo de plantilla `.env.example` a `.env`:
   ```bash
   cp .env.example .env
   ```
2. Configura los valores correspondientes para tu entorno local. El archivo `.env` se encuentra ignorado por `.gitignore` y nunca se almacena en el repositorio.

### 3.2. Variables de Seguridad Centralizadas

| Variable | Descripción | Entorno Local / Dev | Producción (`prod`) |
|---|---|---|---|
| `JWT_SECRET` | Clave secreta compartida para firma HMAC-SHA256 de tokens en los 5 microservicios. | Definida en `.env` local | **Obligatoria** (mínimo 32 caracteres / 256 bits). Falla el arranque si no está configurada o es débil. |
| `ADMIN_API_KEY` | Clave opcional para integraciones internas automatizadas vía cabecera `X-Admin-Key`. | Definida en `.env` local | Opcional / segura. Si no está configurada, sólo se admite autorización por token con rol `ADMIN`. |
| `POSTGRES_USER` | Usuario de PostgreSQL para las bases de datos lógicas. | `postgres` (local) | Definido por el orquestador / Key Vault. |
| `POSTGRES_PASSWORD` | Contraseña de PostgreSQL. | Definida en `.env` | **Obligatoria y explícita**; sin valores predeterminados inseguros. |
| `NOCTIS_SEED_ENABLED`| Habilita o deshabilita la carga inicial de datos de prueba. | `true` (en perfiles dev) | **Deshabilitada automáticamente** en perfil `prod`. |
| `ADMIN_INITIAL_PASSWORD`| Contraseña inicial para el usuario administrador al arrancar. | Opcional | Exigida sólo si se requiere crear un administrador inicial en arranque. |

### 3.3. Cuentas y Accesos en Entorno de Demostración Local

En entornos de desarrollo local (`!prod`), la plataforma inicializa cuentas de prueba con contraseñas cifradas en **BCrypt** (cost factor 12) para validar los flujos de compra y administración:

- **Administrador:** Cuenta de rol `ADMIN` para gestión del catálogo, stock y clientes en `/admin`. En el frontend de producción se han removido credenciales administrativas fijas.
- **Cliente Demo:** Cuentas con rol `CLIENTE` para validación de navegación, compras y consultas de pedidos.

> **Nota de Seguridad:** En el perfil productivo (`prod`), la inicialización automática de usuarios de prueba está estrictamente desactivada y el backend valida la presencia obligatoria de claves criptográficamente seguras.

---

## 4. Arquitectura de Microservicios

El sistema está compuesto por **cinco microservicios independientes** con bases de datos lógicas desacopladas en PostgreSQL y comunicación REST síncrona con control de idempotencia y compensación de transacciones:

| Microservicio | Puerto | Base de Datos | Responsabilidad Principal |
|---|---|---|---|
| **`clientes-service`** | `8081` | `clientes_db` | Registro, autenticación BCrypt, gestión de tokens HMAC-SHA256, roles (`CLIENTE` / `ADMIN`) y edición de perfiles. |
| **`productos-service`** | `8082` | `productos_db` | Catálogo gamer, filtrado por categorías, búsqueda y edición comercial completa protegida por token. |
| **`inventario-service`** | `8083` | `inventario_db` | Control de stock, auditoría de movimientos, reservas, ajuste de existencias y compensaciones. |
| **`ventas-service`** | `8084` | `ventas_db` | Orquestador de compra: validación de cliente, producto, stock y facturación con compensación ante fallos. |
| **`facturacion-service`** | `8085` | `facturacion_db` | Emisión fiscal de facturas digitales con desglose de IVA (19%) e idempotencia por venta. |
| **`frontend`** | `3000` | N/A | Interfaz SPA React con proxy inverso Nginx y diseño dark gamer. |

### Flujo de Compra Orquestado

```text
[ Cliente / Frontend ]
          │ POST /api/ventas (Requiere Cliente Autenticado)
          ▼
   [ ventas-service ]
     ├── 1. Validar cliente ────────────► [ clientes-service ] (8081)
     ├── 2. Validar productos & precios ─► [ productos-service ] (8082)
     ├── 3. Descontar existencias ──────► [ inventario-service ] (8083) [Idempotente]
     │      (Si falla stock: Aborta y retorna error 422/409 sin persistir)
     ├── 4. Registrar venta ────────────► [ ventas_db ]
     ├── 5. Generar factura ────────────► [ facturacion-service ] (8085)
     │      (Si falla factura: Compensa y devuelve el stock en inventario)
     └── 6. Respuesta con Venta y Factura confirmadas al Frontend
```

---

## 5. Nuevas Funcionalidades y Refinamientos (Prompt 02)

1. **Rediseño Global de Campos Desplegables (`CustomSelect.tsx`):**
   - Menús flotantes con esquinas redondeadas, fondo oscuro, elevación con sombra y bordes luminosos discretos.
   - Navegación por teclado accesible (`Enter`, `Space`, `ArrowUp`, `ArrowDown`, `Escape`, `Tab`).
   - Cierre automático al hacer clic fuera del componente y prevención de recortes por desbordamiento.
2. **Edición Comercial Completa de Productos en `/admin`:**
   - Modal precargado para modificar nombre, categoría, precio, descripción, imagen y estado activo.
   - Persistencia real en PostgreSQL (`PUT /api/productos/{id}`).
   - La edición de existencias físicas se mantiene independiente en la pestaña de inventario para preservar la separación de responsabilidades.
3. **Seguridad y Sesiones:**
   - Inicio de tienda en estado visitante (sin sesión asignada por defecto).
   - Menú de usuario interactivo con opciones diferenciadas para visitante vs. autenticado.
   - Cierre de sesión limpio que revoca inmediatamente el acceso y limpia credenciales en el cliente.
   - Contraseña obligatoria con cifrado fuerte BCrypt (`spring-security-crypto`), migración transparente de hashes legacy y rechazo de contraseñas menores a 6 caracteres.
4. **Edición de Datos de Usuario:**
   - El usuario puede editar su nombre, teléfono, dirección de entrega y cambiar su contraseña (exigiendo su contraseña actual para confirmar).
   - El administrador dispone de una pestaña para consultar y actualizar datos de contacto de clientes.
5. **Asistente Guiado de Servicio Técnico en 3 Pasos:**
   - **Paso 1:** Selección de tipo de servicio técnico con `CustomSelect`.
   - **Paso 2:** Selección interactiva de plataforma / dispositivo gamer con tarjetas táctiles e íconos.
   - **Paso 3:** Formulario de síntomas, modelo y datos de contacto, con generación de ticket de seguimiento.
6. **Descarga de Facturas Oficiales:**
   - Al imprimir o guardar la factura en PDF desde `/confirmacion/:id`, el navegador sugiere automáticamente el nombre formateado: `Factura-FAC-2026-XXXXX.pdf`.
7. **Eliminación de Terminología Técnica Visible:**
   - Removidas referencias a "microservicios", "PostgreSQL", "inventario_db", "Docker" o "endpoints" en la interfaz de cara al cliente y administración, utilizando lenguaje de negocio claro y profesional.

---

## 6. Endpoints Principales de la API

### Clientes (`8081`)
- `GET /api/clientes` - Directorio de clientes registrados.
- `GET /api/clientes/{id}` - Consulta de cliente por ID.
- `POST /api/clientes` - Registro con contraseña obligatoria y cifrado BCrypt.
- `POST /api/clientes/login` - Autenticación con contraseña y generación de token HMAC-SHA256.
- `GET /api/clientes/me` - Perfil de la sesión activa autenticada.
- `PUT /api/clientes/{id}` - Actualización de perfil y/o cambio de contraseña.

### Productos (`8082`)
- `GET /api/productos` - Catálogo público activo (soporta `?categoria=` y `?busqueda=`).
- `GET /api/productos/admin` - Catálogo completo para administración *(Requiere Bearer token ADMIN)*.
- `GET /api/productos/{id}` - Detalle de un producto.
- `POST /api/productos` - Registro de nuevo producto *(Requiere Bearer token ADMIN)*.
- `PUT /api/productos/{id}` - Edición comercial completa *(Requiere Bearer token ADMIN)*.
- `PUT /api/productos/{id}/precio` - Actualización rápida de precio *(Requiere Bearer token ADMIN)*.

### Inventario (`8083`)
- `GET /api/inventario` - Existencias consolidadas de todos los productos.
- `GET /api/inventario/producto/{productoId}` - Stock disponible de un producto específico.
- `POST /api/inventario/descontar` - Descuento seguro e idempotente de existencias con `operacionId`.
- `POST /api/inventario/reponer` - Compensación de stock ante reversión de venta.
- `PUT /api/inventario/producto/{productoId}` - Ajuste manual de stock *(Requiere Bearer token ADMIN)*.

### Ventas (`8084`)
- `POST /api/ventas` - Orquesta la compra: valida cliente, producto, descuenta inventario y emite factura.
- `GET /api/ventas` - Historial de ventas registradas.
- `GET /api/ventas/{id}` - Detalle de una venta.
- `GET /api/ventas/cliente/{clienteId}` - Ventas asociadas a un cliente.

### Facturación (`8085`)
- `POST /api/facturas` - Genera factura con subtotal e IVA del 19% discriminado.
- `GET /api/facturas` - Listado de facturas emitidas.
- `GET /api/facturas/{id}` - Detalle de factura.
- `GET /api/facturas/venta/{ventaId}` - Consulta de factura por número de venta.

---

## 7. Pruebas Automatizadas y Calidad de Código

### 7.1. Suite Completa de Tests Backend (Maven Reactor)
```bash
mvn test
```
*Valida: hashing BCrypt, autenticación y emisión de tokens, roles, catálogo y edición de productos, descuento seguro de stock, compensación de inventario ante fallos, orquestación de ventas y facturación con IVA.*

### 7.2. Compilación del Frontend (TypeScript & Vite)
```bash
cd frontend && npm run build
```

---

## 8. Integración con Microsoft Azure

La solución se encuentra preparada para despliegue en Microsoft Azure:
1. **Azure Pipelines (`azure-pipelines.yml`):** Pipeline multinivel de validación, construcción Docker y despliegue automatizado.
2. **Kubernetes en AKS (`infrastructure/kubernetes/`):** Manifiestos con Namespace propio, ConfigMaps, Secretos, Probes de salud, límites de CPU/Memoria y ruteo Ingress.
3. **Seguridad con Azure Key Vault:** Arquitectura basada en *Secrets Store CSI Driver* para inyección segura de credenciales.
4. **Observabilidad con Azure Monitor:** Endpoints de Actuator y filtro distribuido `CorrelationIdFilter` (`X-Correlation-ID`).

Consulta la [Guía de Integración con Azure](infrastructure/azure/azure-integration-guide.md) para más detalles.
