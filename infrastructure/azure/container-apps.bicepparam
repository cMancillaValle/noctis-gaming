// ==============================================================================
// NOCTIS GAMING - PARÁMETROS DE DESPLIEGUE AZURE CONTAINER APPS
// ==============================================================================
// Archivo de parámetros Bicep (.bicepparam) para el entorno de desarrollo (dev).
// Cumple con la restricción de NO incluir contraseñas ni secretos reales en el repositorio.
// Los secretos se capturan dinámicamente desde variables de entorno del operador o pipeline,
// o se sobrescriben directamente como parámetros seguros en la invocación de despliegue.
// ==============================================================================

using 'container-apps.bicep'

// ------------------------------------------------------------------------------
// INFRAESTRUCTURA PREEXISTENTE (dev / brazilsouth)
// ------------------------------------------------------------------------------
param containerAppsEnvironmentName = 'cae-noctis-gaming-dev'
param managedIdentityName = 'id-noctis-acr-pull-dev'
param acrServer = 'acrnoctisgamingdev.azurecr.io'

// ------------------------------------------------------------------------------
// BASE DE DATOS POSTGRESQL FLEXIBLE SERVER
// ------------------------------------------------------------------------------
param postgresHost = 'psql-noctis-gaming-dev.postgres.database.azure.com'
param postgresPort = 5432
param postgresSslMode = 'require'
param postgresUsername = 'psqladmin'

// ------------------------------------------------------------------------------
// ETIQUETA INMUTABLE DE IMÁGENES (NO USAR latest)
// ------------------------------------------------------------------------------
param imageTag = '1.0.0'

// ------------------------------------------------------------------------------
// RECURSOS Y ESCALADO (CONSUMPTION / DEMOSTRACIÓN ACADÉMICA / COSTO MÍNIMO)
// ------------------------------------------------------------------------------
param minReplicas = 0
param maxReplicas = 1
param microserviceCpu = '0.5'
param microserviceMemory = '1.0Gi'
param frontendCpu = '0.25'
param frontendMemory = '0.5Gi'

// ------------------------------------------------------------------------------
// CORS (VACÍO = TOMA AUTOMÁTICAMENTE EL FQDN HTTPS DEL FRONTEND)
// ------------------------------------------------------------------------------
param corsAllowedOrigins = ''

// ------------------------------------------------------------------------------
// CARGA INICIAL DE DEMOSTRACIÓN (false = producción estándar; true = poblar catálogo inicial)
// ------------------------------------------------------------------------------
param seedDemoCatalog = false

// ------------------------------------------------------------------------------
// SECRETOS SEGUROS
// En despliegues locales o CI/CD se leen automáticamente de las variables de entorno.
// Si no están definidas en tiempo de compilación/linting, se utiliza el fallback seguro.
// ------------------------------------------------------------------------------
param postgresPassword = readEnvironmentVariable('POSTGRES_PASSWORD', 'CHANGE_ME_AT_DEPLOYMENT_POSTGRES_PASSWORD')
param jwtSecret = readEnvironmentVariable('JWT_SECRET', 'CHANGE_ME_AT_DEPLOYMENT_JWT_SECRET_32_BYTES_MIN')
param adminApiKey = readEnvironmentVariable('ADMIN_API_KEY', 'CHANGE_ME_AT_DEPLOYMENT_ADMIN_API_KEY')
param adminInitialPassword = readEnvironmentVariable('ADMIN_INITIAL_PASSWORD', '')
