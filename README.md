# Noctis Gaming
## Plataforma de comercio electrónico para la comunidad gamer

**Prototipo académico de arquitectura de microservicios y DevOps**  
Universidad Central, Bogotá, Colombia

Noctis Gaming es una plataforma de comercio electrónico orientada a productos y servicios para la comunidad gamer. Integra una tienda web, gestión de clientes y productos, control de inventario, procesamiento de ventas, facturación y solicitudes de servicio técnico.

La solución se desarrolla mediante cinco microservicios Java con Spring Boot, una interfaz React y bases de datos lógicas independientes en PostgreSQL. Docker Compose permite ejecutar sus componentes de forma integrada en un entorno local.

> Noctis Gaming es un proyecto académico. El entorno local funciona mediante Docker Compose; los recursos de Azure y Kubernetes incluidos en el repositorio constituyen una base para despliegues futuros y no representan una infraestructura productiva ya desplegada.

## Tecnologías

### Lenguajes y desarrollo

[![Java](https://img.shields.io/badge/Java_21-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white)](https://openjdk.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/es/docs/Web/JavaScript)
[![SQL](https://img.shields.io/badge/SQL-336791?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)

### Backend y almacenamiento

[![Spring Boot](https://img.shields.io/badge/Spring_Boot-6DB33F?style=for-the-badge&logo=springboot&logoColor=white)](https://spring.io/projects/spring-boot)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL_16-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Maven](https://img.shields.io/badge/Apache_Maven-C71A36?style=for-the-badge&logo=apachemaven&logoColor=white)](https://maven.apache.org/)

### Interfaz web

[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vite.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Nginx](https://img.shields.io/badge/Nginx-009639?style=for-the-badge&logo=nginx&logoColor=white)](https://nginx.org/)

### Contenedores y herramientas

[![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)
[![Git](https://img.shields.io/badge/Git-F05032?style=for-the-badge&logo=git&logoColor=white)](https://git-scm.com/)
[![Azure DevOps](https://img.shields.io/badge/Azure_DevOps-0078D7?style=for-the-badge&logo=azuredevops&logoColor=white)](https://azure.microsoft.com/products/devops)
[![Kubernetes](https://img.shields.io/badge/Kubernetes-326CE5?style=for-the-badge&logo=kubernetes&logoColor=white)](https://kubernetes.io/)

*Azure DevOps y Kubernetes corresponden a archivos de preparación e integración incluidos en el repositorio.*

## Funcionalidades principales

### Tienda y catálogo

- Exploración de productos gamer y consulta de sus detalles.
- Búsqueda y filtrado por categorías.
- Carrito de compras y confirmación de pedidos.
- Interfaz adaptable con identidad visual oscura, morado y cian.

### Clientes y autenticación

- Registro e inicio de sesión de clientes.
- Gestión de perfiles y actualización de datos personales.
- Autenticación mediante tokens y contraseñas protegidas con BCrypt.
- Acceso diferenciado para clientes y administradores.

### Administración comercial

- Registro y edición de productos desde el panel administrativo.
- Actualización de precios, información comercial y disponibilidad.
- Gestión de existencias y consulta de clientes.
- Separación entre información del catálogo y movimientos de inventario.

### Ventas, inventario y facturación

- Validación de clientes y productos durante la compra.
- Descuento de existencias con control de idempotencia.
- Compensación de inventario ante determinados fallos del proceso.
- Registro de ventas y generación de facturas con IVA discriminado.
- Consulta de compras y facturas asociadas.

### Atención y servicio técnico

- Formulario guiado para solicitudes de soporte técnico.
- Selección de servicio y dispositivo.
- Registro de síntomas y datos de contacto.
- Módulos de conversación y seguimiento de solicitudes.

## Arquitectura general

Noctis Gaming separa las responsabilidades del negocio en cinco microservicios que se comunican mediante API REST. Cada servicio utiliza su propia base de datos lógica en PostgreSQL.

| Componente | Puerto local | Responsabilidad |
|---|---:|---|
| Frontend | `3000` | Tienda web, navegación, autenticación y administración. |
| `clientes-service` | `8081` | Cuentas, perfiles, autenticación y roles. |
| `productos-service` | `8082` | Catálogo, búsqueda y administración de productos. |
| `inventario-service` | `8083` | Existencias, movimientos y compensaciones de stock. |
| `ventas-service` | `8084` | Coordinación y registro del proceso de compra. |
| `facturacion-service` | `8085` | Generación y consulta de facturas. |

### Flujo general de compra

```text
Cliente
   |
   v
Frontend React
   |
   v
ventas-service
   |-- clientes-service: validar cliente
   |-- productos-service: consultar productos y precios
   |-- inventario-service: descontar existencias
   |-- ventas_db: registrar venta
   `-- facturacion-service: generar factura
   |
   v
Confirmación de compra
```

El servicio de ventas coordina la operación y contempla mecanismos de compensación para ciertos errores. Esta organización facilita el desarrollo y mantenimiento independiente de los módulos.

## Estructura del proyecto

```text
noctis-gaming/
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   └── services/
│   ├── Dockerfile
│   └── nginx.conf
├── services/
│   ├── clientes-service/
│   ├── productos-service/
│   ├── inventario-service/
│   ├── ventas-service/
│   └── facturacion-service/
├── infrastructure/
│   ├── azure/
│   ├── docker/postgres/
│   └── kubernetes/
├── docs/references/
├── compose.yaml
├── azure-pipelines.yml
├── iniciar-noctis.bat
├── detener-noctis.bat
├── actualizar-noctis.bat
├── .env.example
├── pom.xml
└── README.md
```

La estructura resume los directorios y archivos principales.

## Requisitos

Para ejecutar el entorno local se requiere:

- Docker Desktop con Docker Compose disponible.
- Recursos suficientes para iniciar PostgreSQL, cinco microservicios y el frontend.
- Archivo `.env` con las variables de configuración necesarias.

Para desarrollar y compilar los módulos fuera de Docker también se utilizan Java 21, Maven, Node.js y npm.

## Configuración y ejecución local

1. Clona el repositorio:

   ```powershell
   git clone https://github.com/cMancillaValle/noctis-gaming.git
   cd noctis-gaming
   ```

2. Crea tu configuración local a partir de la plantilla:

   ```powershell
   Copy-Item .env.example .env
   ```

3. Edita `.env` y establece contraseñas y claves seguras. En particular, configura `JWT_SECRET`, `POSTGRES_PASSWORD` y las variables administrativas necesarias para tu entorno. No publiques este archivo.

4. Construye e inicia los contenedores:

   ```powershell
   docker compose up -d --build
   ```

5. Accede a la aplicación desde `http://localhost:3000`.

Para detener los servicios sin eliminar sus volúmenes:

```powershell
docker compose stop
```

En Windows también están disponibles `iniciar-noctis.bat`, `detener-noctis.bat` y `actualizar-noctis.bat`. El script de inicio reutiliza imágenes existentes, por lo que la primera ejecución o los cambios de código requieren construir las imágenes previamente.

> **Persistencia:** evita `docker compose down -v` si deseas conservar la información almacenada en PostgreSQL. En una base de datos ya inicializada, cambiar `POSTGRES_PASSWORD` en `.env` no actualiza automáticamente la contraseña del usuario existente.

## Seguridad y configuración

- Las claves y contraseñas de ejecución se definen mediante variables de entorno.
- `.env` y los datos locales sensibles deben permanecer fuera del control de versiones.
- Los microservicios utilizan una clave JWT compartida definida por `JWT_SECRET`.
- El acceso administrativo utiliza autorización por rol; la clave `ADMIN_API_KEY` se reserva para las integraciones que la requieran.
- La inicialización de datos de demostración se restringe a entornos no productivos.
- Los perfiles de producción requieren configuración explícita de credenciales.

**Importante:** las credenciales de desarrollo no deben reutilizarse en entornos públicos. Antes de desplegar el sistema, revisa la configuración, rota cualquier credencial expuesta y valida los controles de seguridad.

## Pruebas y compilación

### Backend

Desde la raíz del proyecto:

```powershell
mvn test
```

### Frontend

```powershell
cd frontend
npm install
npm run build
```

Estas instrucciones permiten ejecutar las pruebas Maven disponibles y comprobar la compilación del frontend. No constituyen por sí solas una validación integral de seguridad o de despliegue productivo.

## Integración con Microsoft Azure

El repositorio incluye archivos para preparar una posible evolución hacia servicios administrados de Microsoft Azure:

- `azure-pipelines.yml`: definición de pipeline de integración y despliegue.
- `infrastructure/azure/main.bicep`: infraestructura como código.
- `infrastructure/kubernetes/`: manifiestos de servicios y recursos de Kubernetes.
- `infrastructure/azure/azure-integration-guide.md`: guía de integración.

Entre los servicios considerados se encuentran Azure Container Registry, Azure Kubernetes Service, Azure Key Vault y Azure Monitor.

**Estado:** esta integración está preparada a nivel de configuración y documentación. No se presenta como un despliegue de Azure ejecutado y verificado.

## Estado del proyecto

Noctis Gaming dispone de una implementación local con frontend, microservicios, PostgreSQL y orquestación mediante Docker Compose. Se han realizado compilaciones y pruebas de los módulos, junto con ajustes de configuración y seguridad.

Como trabajo posterior se contempla verificar de nuevo los flujos completos después de rotar las credenciales, ampliar la cobertura de pruebas y validar un despliegue en Azure.

## Contexto académico

Noctis Gaming es un proyecto académico orientado a aplicar conceptos de arquitectura de microservicios, desarrollo web, contenedorización, integración de sistemas y prácticas DevOps.

Su propósito es demostrar cómo una plataforma comercial puede dividirse en servicios con responsabilidades específicas, mantener persistencia de datos y prepararse para procesos de integración y despliegue automatizados.

## Repositorio

[Consultar el código fuente de Noctis Gaming](https://github.com/cMancillaValle/noctis-gaming)

**Noctis Gaming**  
*Tu mundo gamer, siempre activo.*
