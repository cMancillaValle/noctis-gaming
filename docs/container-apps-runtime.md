# Configuración de ejecución en Azure Container Apps

Este documento describe la configuración de runtime; no crea recursos ni ejecuta
despliegues.

## Ingress y puertos

Solo `noctis-frontend` debe tener ingress externo. Los cinco microservicios deben
usar ingress interno dentro del mismo Container Apps Environment:

| Aplicación | Puerto objetivo | Ingress |
| --- | ---: | --- |
| clientes-service | 8081 | Interno |
| productos-service | 8082 | Interno |
| inventario-service | 8083 | Interno |
| ventas-service | 8084 | Interno |
| facturacion-service | 8085 | Interno |
| noctis-frontend | 80 | Externo |

Las URLs internas de producción no incluyen los puertos del contenedor. Container
Apps resuelve los nombres mediante el ingress interno. Docker Compose continúa
inyectando URLs con sus puertos explícitos.

## Variables comunes de los microservicios

- `SPRING_PROFILES_ACTIVE=prod`
- `POSTGRES_HOST=psql-noctis-gaming-dev.postgres.database.azure.com`
- `POSTGRES_PORT=5432`
- `POSTGRES_DATABASE`: base lógica correspondiente a cada servicio
- `POSTGRES_SSLMODE=require`
- `SPRING_DATASOURCE_USERNAME`: referencia a secreto
- `SPRING_DATASOURCE_PASSWORD`: referencia a secreto
- `JWT_SECRET`: referencia al mismo secreto seguro en los cinco servicios
- `CORS_ALLOWED_ORIGINS`: origen HTTPS externo exacto del frontend
- `JAVA_OPTS`: opcional; los valores seguros para contenedores pequeños ya tienen
  un valor predeterminado en las imágenes

`SPRING_DATASOURCE_URL` puede sustituir la construcción por componentes, pero debe
conservar `sslmode=require` o una política TLS más estricta compatible con Azure.

Productos e inventario deben usar `NOCTIS_SEED_ENABLED=false` en operación regular
de producción. Para poblar el catálogo de demostración en bases de datos nuevas, se
puede activar temporalmente mediante `NOCTIS_SEED_ENABLED=true` (o vía el parámetro Bicep
`seedDemoCatalog=true`). La inicialización implementa verificación granular idempotente
(por nombre en productos y por `productoId` en inventario), lo cual garantiza que tras
reinicios o reescalados de los contenedores no se dupliquen productos ni se alteren
existencias ya modificadas por ventas.

## Variables de comunicación

Ventas admite las siguientes sustituciones; sus valores predeterminados de perfil
`prod` son los nombres internos indicados:

- `SERVICES_CLIENTES_URL=http://clientes-service`
- `SERVICES_PRODUCTOS_URL=http://productos-service`
- `SERVICES_INVENTARIO_URL=http://inventario-service`
- `SERVICES_FACTURACION_URL=http://facturacion-service`
- `SERVICES_HTTP_CONNECT_TIMEOUT=2s`
- `SERVICES_HTTP_READ_TIMEOUT=5s`

El frontend utiliza `CLIENTES_SERVICE_URL`, `PRODUCTOS_SERVICE_URL`,
`INVENTARIO_SERVICE_URL`, `VENTAS_SERVICE_URL` y `FACTURACION_SERVICE_URL`. En
Container Apps deben apuntar a los nombres internos sin puerto. Compose conserva
los valores `nombre:puerto`.

## Probes

Para cada microservicio:

- Startup: `/actuator/health/readiness`
- Readiness: `/actuator/health/readiness`
- Liveness: `/actuator/health/liveness`

El frontend puede usar `/` para las tres probes. Los detalles de Actuator están
ocultos y en producción solo se expone el endpoint `health`.
