# Despliegue de Azure Container Apps con Bicep - Noctis Gaming

Este documento describe la infraestructura como código (IaC) en **Bicep** diseñada específicamente para desplegar los seis contenedores de la plataforma **Noctis Gaming** en **Azure Container Apps**, reutilizando la infraestructura preexistente en la región `brazilsouth` y optimizando los costos para un escenario de demostración académica.

---

## 1. Arquitectura de Despliegue en Azure Container Apps

```text
[ Internet / Usuarios ]
           │
           │ (HTTPS / Ingress Externo - Puerto 80)
           ▼
┌─────────────────────────────────────────────────────────────┐
│ Azure Container Apps Environment: cae-noctis-gaming-dev    │
│                                                             │
│   ┌─────────────────────────────────────────────────────┐   │
│   │ noctis-frontend (Nginx + React SPA)                 │   │
│   │ External Ingress (Port 80)                          │   │
│   │ minReplicas: 0 | maxReplicas: 1                     │   │
│   └──────────────────────┬──────────────────────────────┘   │
│                          │                                  │
│                          │ HTTP Interno (Port 80)           │
│         ┌────────────────┼────────────────┬──────────────┐  │
│         ▼                ▼                ▼              ▼  │
│  ┌──────────────┐ ┌──────────────┐ ┌─────────────┐ ┌──────────────┐
│  │ clientes     │ │ productos    │ │ inventario  │ │ facturacion  │
│  │ (Port 8081)  │ │ (Port 8082)  │ │ (Port 8083) │ │ (Port 8085)  │
│  └──────────────┘ └──────┬───────┘ └──────┬──────┘ └──────┬───────┘
│         ▲                │                │               │
│         │                │                │               │
│         │  ┌─────────────┴────────────────┴───────────────┤
│         │  │ HTTP Interno (Orquestación sincrónica)       │
│         │  ▼                                              │
│  ┌──────────────┐                                         │
│  │ ventas       │◄────────────────────────────────────────┘
│  │ (Port 8084)  │
│  └──────────────┘
│                                                             │
└─────────────────────────────────────────────────────────────┘
           │
           │ TLS / sslmode=require (Puerto 5432)
           ▼
┌─────────────────────────────────────────────────────────────┐
│ Azure Database for PostgreSQL Flexible Server               │
│ psql-noctis-gaming-dev.postgres.database.azure.com          │
│                                                             │
│ Bases lógicas independientes:                              │
│ ├── clientes_db                                             │
│ ├── productos_db                                            │
│ ├── inventario_db                                           │
│ ├── ventas_db                                               │
│ └── facturacion_db                                          │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Recursos Reutilizados (Existentes)

La plantilla **NO** crea nuevos recursos troncales; se conecta mediante declaraciones `existing` a los recursos ya aprovisionados:

| Recurso | Identificador / Nombre en Azure | Rol / Función |
|---|---|---|
| **Resource Group** | `rg-noctis-gaming-dev` | Contenedor principal de ciclo de vida en `brazilsouth` |
| **Container Apps Environment** | `cae-noctis-gaming-dev` | Límite de red y entorno administrado para las 6 aplicaciones |
| **Azure Container Registry** | `acrnoctisgamingdev.azurecr.io` | Almacén privado de imágenes Docker |
| **Managed Identity** | `id-noctis-acr-pull-dev` | Identidad asignada por el usuario con rol `AcrPull` para descarga de imágenes |
| **PostgreSQL Flexible Server** | `psql-noctis-gaming-dev.postgres.database.azure.com` | Instancia de base de datos relacional para los 5 microservicios |

---

## 3. Matriz de Aplicaciones y Configuración de Runtime

### 3.1. Ingress, Puertos y Red

| Aplicación | Tipo de Ingress | Target Port | Protocolo | CPU | Memoria |
|---|---|---:|---|---:|---:|
| `clientes-service` | Interno | 8081 | HTTP (`transport: 'auto'`) | 0.5 vCPU | 1.0 Gi |
| `productos-service` | Interno | 8082 | HTTP (`transport: 'auto'`) | 0.5 vCPU | 1.0 Gi |
| `inventario-service` | Interno | 8083 | HTTP (`transport: 'auto'`) | 0.5 vCPU | 1.0 Gi |
| `ventas-service` | Interno | 8084 | HTTP (`transport: 'auto'`) | 0.5 vCPU | 1.0 Gi |
| `facturacion-service` | Interno | 8085 | HTTP (`transport: 'auto'`) | 0.5 vCPU | 1.0 Gi |
| `noctis-frontend` | **Externo** | 80 | HTTP/HTTPS | 0.25 vCPU | 0.5 Gi |

> [!NOTE]
> Las llamadas internas dentro del Container Apps Environment se enrutan mediante el DNS interno en el puerto HTTP estándar (80). Por lo tanto:
> - `ventas-service` consume: `http://clientes-service`, `http://productos-service`, `http://inventario-service`, `http://facturacion-service`.
> - `noctis-frontend` proxypass hacia: `http://clientes-service`, `http://productos-service`, `http://inventario-service`, `http://ventas-service`, `http://facturacion-service`.

### 3.2. Probes de Diagnóstico y Salud

Para soportar los tiempos de inicialización de Spring Boot 3 con migraciones Flyway y validación Hibernate (que pueden superar 80 segundos en arranque en frío):

- **Microservicios (Spring Boot)**:
  - **Startup Probe**:
    - Endpoint: `GET /actuator/health/readiness`
    - `initialDelaySeconds: 15`, `periodSeconds: 10`, `failureThreshold: 18`, `timeoutSeconds: 5`
    - **Margen total de arranque**: $15 + (18 \times 10) = 195\text{ segundos}$ (~3.25 minutos), cubriendo holgadamente cualquier arranque en frío superior a 80s sin provocar reinicios prematuros.
  - **Readiness Probe**:
    - Endpoint: `GET /actuator/health/readiness`
    - `initialDelaySeconds: 5`, `periodSeconds: 10`, `failureThreshold: 3`, `timeoutSeconds: 5`
  - **Liveness Probe**:
    - Endpoint: `GET /actuator/health/liveness`
    - `initialDelaySeconds: 10`, `periodSeconds: 15`, `failureThreshold: 3`, `timeoutSeconds: 5`

- **Frontend (Nginx)**:
  - **Startup / Readiness / Liveness**: `GET /` en puerto 80 con `initialDelaySeconds: 5` y timeouts breves de 3s.

### 3.3. Escalado y Perfil de Carga (Consumption)

- `workloadProfileName: 'Consumption'`
- `minReplicas: 0`: Permite que las réplicas escalen a 0 instancias cuando no reciban tráfico HTTP, eliminando el costo de CPU/memoria durante periodos de inactividad.
- `maxReplicas: 1`: Garantiza que en periodos de prueba o demostración no se excedan las cuotas ni se disparen costos innecesarios.

---

## 4. Gestión de Secretos y Variables Sensibles

Siguiendo las restricciones de seguridad:
- **Ninguna credencial o secreto sensible se almacena en el repositorio**.
- Los parámetros `@secure()` en Bicep (`postgresPassword`, `jwtSecret`, `adminApiKey`, `adminInitialPassword`) evitan que los valores aparezcan en los registros del despliegue.
- Cada Container App define sus secretos dentro del bloque `configuration.secrets` de Azure Container Apps y los inyecta en el contenedor mediante `secretRef`.
- **JWT_SECRET**: Es compartido de forma idéntica entre los 5 microservicios (`clientes-service`, `productos-service`, `inventario-service`, `ventas-service`, `facturacion-service`) para garantizar la verificación y firma interoperable de tokens JWT.
- **ADMIN_API_KEY**: Inyectada en `productos-service` e `inventario-service` como secreto seguro.

---

## 5. Comandos de Validación y Despliegue

### 5.1. Validación Sintáctica y Linting Local (Offline)

Si se dispone de Bicep CLI o Azure CLI:

```bash
# Compilar y validar sintaxis de la plantilla
bicep build infrastructure/azure/container-apps.bicep

# Ejecutar el linter de reglas y buenas prácticas
bicep lint infrastructure/azure/container-apps.bicep

# Validar el archivo de parámetros
bicep build-params infrastructure/azure/container-apps.bicepparam
```

### 5.2. Validación contra Azure (Dry-Run / Pre-vuelo)

Sin realizar cambios reales en la infraestructura:

```bash
# Iniciar sesión y fijar suscripción
az login
az account set --subscription "<ID_O_NOMBRE_DE_SUSCRIPCION>"

# Validación de pre-vuelo (comprueba cuotas, nombres y compatibilidad)
az deployment group validate \
  --resource-group rg-noctis-gaming-dev \
  --template-file infrastructure/azure/container-apps.bicep \
  --parameters infrastructure/azure/container-apps.bicepparam \
  --parameters postgresPassword="$POSTGRES_PASSWORD" jwtSecret="$JWT_SECRET" adminApiKey="$ADMIN_API_KEY"

# Previsualización de cambios (What-If)
az deployment group what-if \
  --resource-group rg-noctis-gaming-dev \
  --template-file infrastructure/azure/container-apps.bicep \
  --parameters infrastructure/azure/container-apps.bicepparam \
  --parameters postgresPassword="$POSTGRES_PASSWORD" jwtSecret="$JWT_SECRET" adminApiKey="$ADMIN_API_KEY"
```

### 5.3. Comando de Despliegue (Cuando los bloqueos estén resueltos)

```bash
az deployment group create \
  --resource-group rg-noctis-gaming-dev \
  --name "deploy-noctis-container-apps-$(date +%Y%m%d%H%M%S)" \
  --template-file infrastructure/azure/container-apps.bicep \
  --parameters infrastructure/azure/container-apps.bicepparam \
  --parameters postgresPassword="$POSTGRES_PASSWORD" \
               jwtSecret="$JWT_SECRET" \
               adminApiKey="$ADMIN_API_KEY" \
               imageTag="1.0.0"
```

---

## 6. Estimación de Costos y Riesgos Potenciales

### 6.1. Optimización de Costos (Demostración Académica)
- **Perfil Consumption de Azure Container Apps**:
  - Primeras 180,000 vCPU-segundos y 360,000 GiB-segundos gratuitos por mes por suscripción.
  - Al configurar `minReplicas: 0`, si el sistema no recibe peticiones, el costo de cómputo en Container Apps es **$0 USD**.
  - Al recibir una solicitud, el escalado a 1 réplica con 0.5 vCPU y 1.0 GiB consume una fracción mínima de centavos por hora activa.
- **Log Analytics & ACR**:
  - ACR existente (plan Basic/Standard) y Log Analytics tienen costos fijos mínimos asociados al almacenamiento.

### 6.2. Riesgos Potenciales
1. **Latencia de Arranque en Frío (Cold Start)**:
   - Al usar `minReplicas: 0`, la primera petición tras un periodo de inactividad tardará entre 40 y 90 segundos mientras el contenedor se descarga, la JVM arranca y se validan las migraciones de base de datos.
   - *Mitigación*: Durante la sesión de demostración académica en vivo, se puede ajustar temporalmente `minReplicas: 1` para mantener las réplicas calientes.
2. **Consumo de Memoria JVM en Contenedores Pequeños**:
   - Spring Boot 3 con Java 21 requiere al menos 512MB-1GB de RAM. Las imágenes ya cuentan con `-XX:+UseSerialGC -XX:MaxRAMPercentage=75.0` para operar de forma segura en 1.0 GiB.

---

## 7. Bloqueos Pendientes antes del Despliegue

Antes de ejecutar el despliegue efectivo en Azure, deben resolverse los siguientes aspectos:

1. **Conectividad de Red y Firewall en PostgreSQL Flexible Server**:
   - `psql-noctis-gaming-dev.postgres.database.azure.com` debe permitir el tráfico procedente de Azure Container Apps.
   - Si PostgreSQL está configurado con acceso público restringido por firewall, se debe habilitar la opción *"Permitir acceso público desde cualquier servicio de Azure"* o configurar VNet Integration / Private Endpoint.
   - **Nota**: Esta plantilla Bicep NO afirma ni resuelve dicha conectividad de red, la cual debe ser validada independientemente a nivel de infraestructura del servidor de base de datos.
2. **Publicación Previa de Imágenes en ACR**:
   - Las imágenes de los 6 contenedores (`noctis/clientes-service:1.0.X`, `noctis/productos-service:1.0.X`, `noctis/inventario-service:1.0.X`, `noctis/ventas-service:1.0.X`, `noctis/facturacion-service:1.0.X`, `noctis/noctis-frontend:1.0.X`) deben estar construidas y publicadas en `acrnoctisgamingdev.azurecr.io` mediante el pipeline CI antes de lanzar el despliegue; de lo contrario, el aprovisionamiento fallará por timeout de descarga de imagen.
   - La convención de etiquetas utiliza `1.0.$(Build.BuildId)` como identificador inmutable por compilación.

---

## 8. Estrategia de Carga Inicial del Catálogo de Demostración

Para poblar las bases de datos de Azure en una demostración académica manteniendo el principio de producción limpia:

1. **Idempotencia y prevención de duplicados**:
   - `productos-service` verifica cada producto por su nombre (`existsByNombre`) antes de insertar; si ya existe, lo omite.
   - `inventario-service` verifica cada ítem por su ID de producto (`existsByProductoId`) antes de registrar existencias iniciales; si ya existe un registro, respeta el stock actual y no inserta duplicados ni viola la restricción `uk_inventario_items_producto`.
   - Reiniciar o escalar las réplicas en Azure **no duplica productos ni sobreescribe el stock**.
2. **Activación de la carga inicial**:
   - **En Bicep**: Establecer el parámetro `seedDemoCatalog: true` durante el primer despliegue:
     ```bash
     az deployment group create ... --parameters seedDemoCatalog=true
     ```
   - **En runtime (Container Apps)**: Pasar la variable de entorno `NOCTIS_SEED_ENABLED=true` a los contenedores de `productos-service` e `inventario-service`.
3. **Desactivación posterior**:
   - Una vez cargados los 12 productos y sus existencias en PostgreSQL, se puede restablecer `seedDemoCatalog: false` (o `NOCTIS_SEED_ENABLED=false`).
   - Incluso si se dejara activo por descuido, la verificación granular de idempotencia asegura que no habrá inserciones adicionales.
4. **No interferencia con Flyway**:
   - Las migraciones Flyway se ejecutan y validan durante el arranque de Spring Boot **antes** de que los repositorios JPA y los `CommandLineRunner` se ejecuten. `DataInitializer` opera únicamente sobre las tablas ya estructuradas por Flyway y no modifica el historial `flyway_schema_history`.
3. **Creación de Bases Lógicas y Usuarios en PostgreSQL**:
   - Las bases de datos `clientes_db`, `productos_db`, `inventario_db`, `ventas_db` y `facturacion_db` deben existir en la instancia Flexible Server, y el usuario `psqladmin` debe tener permisos para crear y modificar tablas (ejecución de migraciones Flyway).
4. **Suministro de Secretos en el Pipeline / Shell**:
   - Asegurar que `POSTGRES_PASSWORD`, `JWT_SECRET` (mínimo 32 caracteres / 256 bits) y `ADMIN_API_KEY` estén disponibles como variables de entorno o variables secretas en Azure DevOps / GitHub Actions.
