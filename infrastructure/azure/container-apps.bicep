// ==============================================================================
// NOCTIS GAMING - DESPLIEGUE EN AZURE CONTAINER APPS
// ==============================================================================
// Plantilla Bicep para desplegar los 6 contenedores de Noctis Gaming:
// - 5 Microservicios Spring Boot 3 (ingress interno):
//     * clientes-service    (puerto 8081)
//     * productos-service   (puerto 8082)
//     * inventario-service  (puerto 8083)
//     * ventas-service      (puerto 8084)
//     * facturacion-service (puerto 8085)
// - 1 Frontend React/Vite/Nginx (ingress externo, puerto 80)
// Reutiliza los recursos preexistentes: Resource Group, ACR, Managed Identity,
// Container Apps Environment y Azure Database for PostgreSQL Flexible Server.
// ==============================================================================

@description('Ubicación de los recursos de Azure Container Apps (debe coincidir con la del Container Apps Environment)')
param location string = resourceGroup().location

// ------------------------------------------------------------------------------
// RECURSOS PREEXISTENTES
// ------------------------------------------------------------------------------

@description('Nombre del Azure Container Apps Environment existente')
param containerAppsEnvironmentName string = 'cae-noctis-gaming-dev'

@description('Nombre de la Identidad Administrada asignada por el usuario existente con permisos AcrPull')
param managedIdentityName string = 'id-noctis-acr-pull-dev'

@description('FQDN del servidor Azure Container Registry existente')
param acrServer string = 'acrnoctisgamingdev.azurecr.io'

@description('FQDN del servidor Azure Database for PostgreSQL Flexible Server existente')
param postgresHost string = 'psql-noctis-gaming-dev.postgres.database.azure.com'

@description('Puerto de conexión a PostgreSQL')
param postgresPort int = 5432

@description('Modo SSL para la conexión JDBC de PostgreSQL en Azure')
param postgresSslMode string = 'require'

@description('Usuario administrador para las bases de datos PostgreSQL')
param postgresUsername string = 'psqladmin'

// ------------------------------------------------------------------------------
// PARÁMETROS DE IMÁGENES Y VERSIONADO (ETIQUETAS INMUTABLES)
// ------------------------------------------------------------------------------

@description('Etiqueta inmutable de imagen de contenedor (ej: 1.0.0, commit-sha o build ID). NO usar latest')
@minLength(1)
param imageTag string = '1.0.0'

@description('Nombre del repositorio de imagen para clientes-service en ACR')
param clientesImageName string = 'noctis/clientes-service'

@description('Nombre del repositorio de imagen para productos-service en ACR')
param productosImageName string = 'noctis/productos-service'

@description('Nombre del repositorio de imagen para inventario-service en ACR')
param inventarioImageName string = 'noctis/inventario-service'

@description('Nombre del repositorio de imagen para ventas-service en ACR')
param ventasImageName string = 'noctis/ventas-service'

@description('Nombre del repositorio de imagen para facturacion-service en ACR')
param facturacionImageName string = 'noctis/facturacion-service'

@description('Nombre del repositorio de imagen para noctis-frontend en ACR')
param frontendImageName string = 'noctis/noctis-frontend'

@description('Habilita la carga inicial idempotente del catálogo de productos y existencias de inventario para la demostración')
param seedDemoCatalog bool = false

// ------------------------------------------------------------------------------
// NOMBRES DE LAS CONTAINER APPS (RESOLUCIÓN DNS INTERNA)
// ------------------------------------------------------------------------------

@description('Nombre de la aplicación de Clientes en Container Apps')
param clientesAppName string = 'clientes-service'

@description('Nombre de la aplicación de Productos en Container Apps')
param productosAppName string = 'productos-service'

@description('Nombre de la aplicación de Inventario en Container Apps')
param inventarioAppName string = 'inventario-service'

@description('Nombre de la aplicación de Ventas en Container Apps')
param ventasAppName string = 'ventas-service'

@description('Nombre de la aplicación de Facturación en Container Apps')
param facturacionAppName string = 'facturacion-service'

@description('Nombre de la aplicación de Frontend en Container Apps')
param frontendAppName string = 'noctis-frontend'

// ------------------------------------------------------------------------------
// SECRETOS Y CREDENCIALES SEGURAS
// ------------------------------------------------------------------------------

@description('Contraseña del usuario administrador de PostgreSQL')
@secure()
@minLength(1)
param postgresPassword string

@description('Secreto criptográfico para firma y verificación de tokens JWT (compartido entre los 5 microservicios)')
@secure()
@minLength(32)
param jwtSecret string

@description('Clave de API administrativa para endpoints de mutación en productos e inventario')
@secure()
@minLength(1)
param adminApiKey string

@description('Contraseña inicial opcional del administrador en clientes-service (dejar vacío si no se requiere sembrar)')
@secure()
param adminInitialPassword string = ''

// ------------------------------------------------------------------------------
// CONFIGURACIÓN DE ESCALADO Y RECURSOS (CONSUMPTION / COSTOS MÍNIMOS)
// ------------------------------------------------------------------------------

@description('Mínimo de réplicas para perfil Consumption (0 permite escala a cero en reposo para ahorro de costos)')
@minValue(0)
@maxValue(1)
param minReplicas int = 0

@description('Máximo de réplicas para control estricto de concurrencia y costos')
@minValue(1)
@maxValue(5)
param maxReplicas int = 1

@description('Asignación de CPU para los microservicios Spring Boot (ej: 0.5)')
param microserviceCpu string = '0.5'

@description('Asignación de memoria para los microservicios Spring Boot (ej: 1.0Gi)')
param microserviceMemory string = '1.0Gi'

@description('Asignación de CPU para el contenedor Nginx de Frontend (ej: 0.25)')
param frontendCpu string = '0.25'

@description('Asignación de memoria para el contenedor Nginx de Frontend (ej: 0.5Gi)')
param frontendMemory string = '0.5Gi'

// ------------------------------------------------------------------------------
// CONFIGURACIÓN DE CORS
// ------------------------------------------------------------------------------

@description('Orígenes CORS permitidos (separados por coma). Si se deja vacío, se resuelve automáticamente con el dominio HTTPS del frontend')
param corsAllowedOrigins string = ''

// ==============================================================================
// REFERENCIAS A RECURSOS EXISTENTES
// ==============================================================================

resource containerAppsEnvironment 'Microsoft.App/managedEnvironments@2024-03-01' existing = {
  name: containerAppsEnvironmentName
}

resource acrPullIdentity 'Microsoft.ManagedIdentity/userAssignedIdentities@2023-01-31' existing = {
  name: managedIdentityName
}

// ==============================================================================
// VARIABLES CALCULADAS
// ==============================================================================

// Dominio HTTPS del frontend para CORS dinámico si no se suministró valor explícito
var defaultFrontendOrigin = 'https://${frontendAppName}.${containerAppsEnvironment.properties.defaultDomain}'
var resolvedCorsAllowedOrigins = !empty(corsAllowedOrigins) ? corsAllowedOrigins : defaultFrontendOrigin

// ==============================================================================
// 1. MICROSERVICIO: CLIENTES-SERVICE (Puerto 8081, Ingress Interno)
// ==============================================================================

var clientesBaseSecrets = [
  {
    name: 'datasource-password'
    value: postgresPassword
  }
  {
    name: 'jwt-secret'
    value: jwtSecret
  }
]
var clientesExtraSecrets = !empty(adminInitialPassword) ? [
  {
    name: 'admin-initial-password'
    value: adminInitialPassword
  }
] : []
var clientesSecrets = concat(clientesBaseSecrets, clientesExtraSecrets)

var clientesBaseEnv = [
  {
    name: 'SPRING_PROFILES_ACTIVE'
    value: 'prod'
  }
  {
    name: 'PORT'
    value: '8081'
  }
  {
    name: 'POSTGRES_HOST'
    value: postgresHost
  }
  {
    name: 'POSTGRES_PORT'
    value: string(postgresPort)
  }
  {
    name: 'POSTGRES_DATABASE'
    value: 'clientes_db'
  }
  {
    name: 'POSTGRES_SSLMODE'
    value: postgresSslMode
  }
  {
    name: 'SPRING_DATASOURCE_USERNAME'
    value: postgresUsername
  }
  {
    name: 'SPRING_DATASOURCE_PASSWORD'
    secretRef: 'datasource-password'
  }
  {
    name: 'JWT_SECRET'
    secretRef: 'jwt-secret'
  }
  {
    name: 'NOCTIS_SEED_ENABLED'
    value: string(seedDemoCatalog)
  }
  {
    name: 'CORS_ALLOWED_ORIGINS'
    value: resolvedCorsAllowedOrigins
  }
]
var clientesExtraEnv = !empty(adminInitialPassword) ? [
  {
    name: 'ADMIN_INITIAL_PASSWORD'
    secretRef: 'admin-initial-password'
  }
] : []
var clientesEnv = concat(clientesBaseEnv, clientesExtraEnv)

resource clientesApp 'Microsoft.App/containerApps@2024-03-01' = {
  name: clientesAppName
  location: location
  identity: {
    type: 'UserAssigned'
    userAssignedIdentities: {
      '${acrPullIdentity.id}': {}
    }
  }
  properties: {
    environmentId: containerAppsEnvironment.id
    workloadProfileName: 'Consumption'
    configuration: {
      activeRevisionsMode: 'Single'
      ingress: {
        external: false
        targetPort: 8081
        transport: 'auto'
        allowInsecure: false
      }
      registries: [
        {
          server: acrServer
          identity: acrPullIdentity.id
        }
      ]
      secrets: clientesSecrets
    }
    template: {
      containers: [
        {
          name: 'clientes-service'
          image: '${acrServer}/${clientesImageName}:${imageTag}'
          resources: {
            cpu: json(microserviceCpu)
            memory: microserviceMemory
          }
          env: clientesEnv
          probes: [
            {
              type: 'Startup'
              httpGet: {
                path: '/actuator/health/readiness'
                port: 8081
                scheme: 'HTTP'
              }
              initialDelaySeconds: 15
              periodSeconds: 10
              failureThreshold: 18
              timeoutSeconds: 5
            }
            {
              type: 'Readiness'
              httpGet: {
                path: '/actuator/health/readiness'
                port: 8081
                scheme: 'HTTP'
              }
              initialDelaySeconds: 5
              periodSeconds: 10
              failureThreshold: 3
              timeoutSeconds: 5
            }
            {
              type: 'Liveness'
              httpGet: {
                path: '/actuator/health/liveness'
                port: 8081
                scheme: 'HTTP'
              }
              initialDelaySeconds: 10
              periodSeconds: 15
              failureThreshold: 3
              timeoutSeconds: 5
            }
          ]
        }
      ]
      scale: {
        minReplicas: minReplicas
        maxReplicas: maxReplicas
      }
    }
  }
}

// ==============================================================================
// 2. MICROSERVICIO: PRODUCTOS-SERVICE (Puerto 8082, Ingress Interno)
// ==============================================================================

resource productosApp 'Microsoft.App/containerApps@2024-03-01' = {
  name: productosAppName
  location: location
  identity: {
    type: 'UserAssigned'
    userAssignedIdentities: {
      '${acrPullIdentity.id}': {}
    }
  }
  properties: {
    environmentId: containerAppsEnvironment.id
    workloadProfileName: 'Consumption'
    configuration: {
      activeRevisionsMode: 'Single'
      ingress: {
        external: false
        targetPort: 8082
        transport: 'auto'
        allowInsecure: false
      }
      registries: [
        {
          server: acrServer
          identity: acrPullIdentity.id
        }
      ]
      secrets: [
        {
          name: 'datasource-password'
          value: postgresPassword
        }
        {
          name: 'jwt-secret'
          value: jwtSecret
        }
        {
          name: 'admin-api-key'
          value: adminApiKey
        }
      ]
    }
    template: {
      containers: [
        {
          name: 'productos-service'
          image: '${acrServer}/${productosImageName}:${imageTag}'
          resources: {
            cpu: json(microserviceCpu)
            memory: microserviceMemory
          }
          env: [
            {
              name: 'SPRING_PROFILES_ACTIVE'
              value: 'prod'
            }
            {
              name: 'PORT'
              value: '8082'
            }
            {
              name: 'POSTGRES_HOST'
              value: postgresHost
            }
            {
              name: 'POSTGRES_PORT'
              value: string(postgresPort)
            }
            {
              name: 'POSTGRES_DATABASE'
              value: 'productos_db'
            }
            {
              name: 'POSTGRES_SSLMODE'
              value: postgresSslMode
            }
            {
              name: 'SPRING_DATASOURCE_USERNAME'
              value: postgresUsername
            }
            {
              name: 'SPRING_DATASOURCE_PASSWORD'
              secretRef: 'datasource-password'
            }
            {
              name: 'JWT_SECRET'
              secretRef: 'jwt-secret'
            }
            {
              name: 'ADMIN_API_KEY'
              secretRef: 'admin-api-key'
            }
            {
              name: 'NOCTIS_SEED_ENABLED'
              value: string(seedDemoCatalog)
            }
            {
              name: 'CORS_ALLOWED_ORIGINS'
              value: resolvedCorsAllowedOrigins
            }
          ]
          probes: [
            {
              type: 'Startup'
              httpGet: {
                path: '/actuator/health/readiness'
                port: 8082
                scheme: 'HTTP'
              }
              initialDelaySeconds: 15
              periodSeconds: 10
              failureThreshold: 18
              timeoutSeconds: 5
            }
            {
              type: 'Readiness'
              httpGet: {
                path: '/actuator/health/readiness'
                port: 8082
                scheme: 'HTTP'
              }
              initialDelaySeconds: 5
              periodSeconds: 10
              failureThreshold: 3
              timeoutSeconds: 5
            }
            {
              type: 'Liveness'
              httpGet: {
                path: '/actuator/health/liveness'
                port: 8082
                scheme: 'HTTP'
              }
              initialDelaySeconds: 10
              periodSeconds: 15
              failureThreshold: 3
              timeoutSeconds: 5
            }
          ]
        }
      ]
      scale: {
        minReplicas: minReplicas
        maxReplicas: maxReplicas
      }
    }
  }
}

// ==============================================================================
// 3. MICROSERVICIO: INVENTARIO-SERVICE (Puerto 8083, Ingress Interno)
// ==============================================================================

resource inventarioApp 'Microsoft.App/containerApps@2024-03-01' = {
  name: inventarioAppName
  location: location
  identity: {
    type: 'UserAssigned'
    userAssignedIdentities: {
      '${acrPullIdentity.id}': {}
    }
  }
  properties: {
    environmentId: containerAppsEnvironment.id
    workloadProfileName: 'Consumption'
    configuration: {
      activeRevisionsMode: 'Single'
      ingress: {
        external: false
        targetPort: 8083
        transport: 'auto'
        allowInsecure: false
      }
      registries: [
        {
          server: acrServer
          identity: acrPullIdentity.id
        }
      ]
      secrets: [
        {
          name: 'datasource-password'
          value: postgresPassword
        }
        {
          name: 'jwt-secret'
          value: jwtSecret
        }
        {
          name: 'admin-api-key'
          value: adminApiKey
        }
      ]
    }
    template: {
      containers: [
        {
          name: 'inventario-service'
          image: '${acrServer}/${inventarioImageName}:${imageTag}'
          resources: {
            cpu: json(microserviceCpu)
            memory: microserviceMemory
          }
          env: [
            {
              name: 'SPRING_PROFILES_ACTIVE'
              value: 'prod'
            }
            {
              name: 'PORT'
              value: '8083'
            }
            {
              name: 'POSTGRES_HOST'
              value: postgresHost
            }
            {
              name: 'POSTGRES_PORT'
              value: string(postgresPort)
            }
            {
              name: 'POSTGRES_DATABASE'
              value: 'inventario_db'
            }
            {
              name: 'POSTGRES_SSLMODE'
              value: postgresSslMode
            }
            {
              name: 'SPRING_DATASOURCE_USERNAME'
              value: postgresUsername
            }
            {
              name: 'SPRING_DATASOURCE_PASSWORD'
              secretRef: 'datasource-password'
            }
            {
              name: 'JWT_SECRET'
              secretRef: 'jwt-secret'
            }
            {
              name: 'ADMIN_API_KEY'
              secretRef: 'admin-api-key'
            }
            {
              name: 'NOCTIS_SEED_ENABLED'
              value: string(seedDemoCatalog)
            }
            {
              name: 'CORS_ALLOWED_ORIGINS'
              value: resolvedCorsAllowedOrigins
            }
          ]
          probes: [
            {
              type: 'Startup'
              httpGet: {
                path: '/actuator/health/readiness'
                port: 8083
                scheme: 'HTTP'
              }
              initialDelaySeconds: 15
              periodSeconds: 10
              failureThreshold: 18
              timeoutSeconds: 5
            }
            {
              type: 'Readiness'
              httpGet: {
                path: '/actuator/health/readiness'
                port: 8083
                scheme: 'HTTP'
              }
              initialDelaySeconds: 5
              periodSeconds: 10
              failureThreshold: 3
              timeoutSeconds: 5
            }
            {
              type: 'Liveness'
              httpGet: {
                path: '/actuator/health/liveness'
                port: 8083
                scheme: 'HTTP'
              }
              initialDelaySeconds: 10
              periodSeconds: 15
              failureThreshold: 3
              timeoutSeconds: 5
            }
          ]
        }
      ]
      scale: {
        minReplicas: minReplicas
        maxReplicas: maxReplicas
      }
    }
  }
}

// ==============================================================================
// 4. MICROSERVICIO: FACTURACION-SERVICE (Puerto 8085, Ingress Interno)
// ==============================================================================

resource facturacionApp 'Microsoft.App/containerApps@2024-03-01' = {
  name: facturacionAppName
  location: location
  identity: {
    type: 'UserAssigned'
    userAssignedIdentities: {
      '${acrPullIdentity.id}': {}
    }
  }
  properties: {
    environmentId: containerAppsEnvironment.id
    workloadProfileName: 'Consumption'
    configuration: {
      activeRevisionsMode: 'Single'
      ingress: {
        external: false
        targetPort: 8085
        transport: 'auto'
        allowInsecure: false
      }
      registries: [
        {
          server: acrServer
          identity: acrPullIdentity.id
        }
      ]
      secrets: [
        {
          name: 'datasource-password'
          value: postgresPassword
        }
        {
          name: 'jwt-secret'
          value: jwtSecret
        }
      ]
    }
    template: {
      containers: [
        {
          name: 'facturacion-service'
          image: '${acrServer}/${facturacionImageName}:${imageTag}'
          resources: {
            cpu: json(microserviceCpu)
            memory: microserviceMemory
          }
          env: [
            {
              name: 'SPRING_PROFILES_ACTIVE'
              value: 'prod'
            }
            {
              name: 'PORT'
              value: '8085'
            }
            {
              name: 'POSTGRES_HOST'
              value: postgresHost
            }
            {
              name: 'POSTGRES_PORT'
              value: string(postgresPort)
            }
            {
              name: 'POSTGRES_DATABASE'
              value: 'facturacion_db'
            }
            {
              name: 'POSTGRES_SSLMODE'
              value: postgresSslMode
            }
            {
              name: 'SPRING_DATASOURCE_USERNAME'
              value: postgresUsername
            }
            {
              name: 'SPRING_DATASOURCE_PASSWORD'
              secretRef: 'datasource-password'
            }
            {
              name: 'JWT_SECRET'
              secretRef: 'jwt-secret'
            }
            {
              name: 'CORS_ALLOWED_ORIGINS'
              value: resolvedCorsAllowedOrigins
            }
          ]
          probes: [
            {
              type: 'Startup'
              httpGet: {
                path: '/actuator/health/readiness'
                port: 8085
                scheme: 'HTTP'
              }
              initialDelaySeconds: 15
              periodSeconds: 10
              failureThreshold: 18
              timeoutSeconds: 5
            }
            {
              type: 'Readiness'
              httpGet: {
                path: '/actuator/health/readiness'
                port: 8085
                scheme: 'HTTP'
              }
              initialDelaySeconds: 5
              periodSeconds: 10
              failureThreshold: 3
              timeoutSeconds: 5
            }
            {
              type: 'Liveness'
              httpGet: {
                path: '/actuator/health/liveness'
                port: 8085
                scheme: 'HTTP'
              }
              initialDelaySeconds: 10
              periodSeconds: 15
              failureThreshold: 3
              timeoutSeconds: 5
            }
          ]
        }
      ]
      scale: {
        minReplicas: minReplicas
        maxReplicas: maxReplicas
      }
    }
  }
}

// ==============================================================================
// 5. MICROSERVICIO: VENTAS-SERVICE (Puerto 8084, Ingress Interno)
// ==============================================================================

resource ventasApp 'Microsoft.App/containerApps@2024-03-01' = {
  name: ventasAppName
  location: location
  identity: {
    type: 'UserAssigned'
    userAssignedIdentities: {
      '${acrPullIdentity.id}': {}
    }
  }
  properties: {
    environmentId: containerAppsEnvironment.id
    workloadProfileName: 'Consumption'
    configuration: {
      activeRevisionsMode: 'Single'
      ingress: {
        external: false
        targetPort: 8084
        transport: 'auto'
        allowInsecure: false
      }
      registries: [
        {
          server: acrServer
          identity: acrPullIdentity.id
        }
      ]
      secrets: [
        {
          name: 'datasource-password'
          value: postgresPassword
        }
        {
          name: 'jwt-secret'
          value: jwtSecret
        }
      ]
    }
    template: {
      containers: [
        {
          name: 'ventas-service'
          image: '${acrServer}/${ventasImageName}:${imageTag}'
          resources: {
            cpu: json(microserviceCpu)
            memory: microserviceMemory
          }
          env: [
            {
              name: 'SPRING_PROFILES_ACTIVE'
              value: 'prod'
            }
            {
              name: 'PORT'
              value: '8084'
            }
            {
              name: 'POSTGRES_HOST'
              value: postgresHost
            }
            {
              name: 'POSTGRES_PORT'
              value: string(postgresPort)
            }
            {
              name: 'POSTGRES_DATABASE'
              value: 'ventas_db'
            }
            {
              name: 'POSTGRES_SSLMODE'
              value: postgresSslMode
            }
            {
              name: 'SPRING_DATASOURCE_USERNAME'
              value: postgresUsername
            }
            {
              name: 'SPRING_DATASOURCE_PASSWORD'
              secretRef: 'datasource-password'
            }
            {
              name: 'JWT_SECRET'
              secretRef: 'jwt-secret'
            }
            {
              name: 'SERVICES_CLIENTES_URL'
              value: 'http://${clientesAppName}'
            }
            {
              name: 'SERVICES_PRODUCTOS_URL'
              value: 'http://${productosAppName}'
            }
            {
              name: 'SERVICES_INVENTARIO_URL'
              value: 'http://${inventarioAppName}'
            }
            {
              name: 'SERVICES_FACTURACION_URL'
              value: 'http://${facturacionAppName}'
            }
            {
              name: 'SERVICES_HTTP_CONNECT_TIMEOUT'
              value: '2s'
            }
            {
              name: 'SERVICES_HTTP_READ_TIMEOUT'
              value: '5s'
            }
            {
              name: 'CORS_ALLOWED_ORIGINS'
              value: resolvedCorsAllowedOrigins
            }
          ]
          probes: [
            {
              type: 'Startup'
              httpGet: {
                path: '/actuator/health/readiness'
                port: 8084
                scheme: 'HTTP'
              }
              initialDelaySeconds: 15
              periodSeconds: 10
              failureThreshold: 18
              timeoutSeconds: 5
            }
            {
              type: 'Readiness'
              httpGet: {
                path: '/actuator/health/readiness'
                port: 8084
                scheme: 'HTTP'
              }
              initialDelaySeconds: 5
              periodSeconds: 10
              failureThreshold: 3
              timeoutSeconds: 5
            }
            {
              type: 'Liveness'
              httpGet: {
                path: '/actuator/health/liveness'
                port: 8084
                scheme: 'HTTP'
              }
              initialDelaySeconds: 10
              periodSeconds: 15
              failureThreshold: 3
              timeoutSeconds: 5
            }
          ]
        }
      ]
      scale: {
        minReplicas: minReplicas
        maxReplicas: maxReplicas
      }
    }
  }
}

// ==============================================================================
// 6. FRONTEND: NOCTIS-FRONTEND (Puerto 80, Ingress Externo)
// ==============================================================================

resource frontendApp 'Microsoft.App/containerApps@2024-03-01' = {
  name: frontendAppName
  location: location
  identity: {
    type: 'UserAssigned'
    userAssignedIdentities: {
      '${acrPullIdentity.id}': {}
    }
  }
  properties: {
    environmentId: containerAppsEnvironment.id
    workloadProfileName: 'Consumption'
    configuration: {
      activeRevisionsMode: 'Single'
      ingress: {
        external: true
        targetPort: 80
        transport: 'auto'
        allowInsecure: false
      }
      registries: [
        {
          server: acrServer
          identity: acrPullIdentity.id
        }
      ]
    }
    template: {
      containers: [
        {
          name: 'noctis-frontend'
          image: '${acrServer}/${frontendImageName}:${imageTag}'
          resources: {
            cpu: json(frontendCpu)
            memory: frontendMemory
          }
          env: [
            {
              name: 'CLIENTES_SERVICE_URL'
              value: 'http://${clientesAppName}'
            }
            {
              name: 'PRODUCTOS_SERVICE_URL'
              value: 'http://${productosAppName}'
            }
            {
              name: 'INVENTARIO_SERVICE_URL'
              value: 'http://${inventarioAppName}'
            }
            {
              name: 'VENTAS_SERVICE_URL'
              value: 'http://${ventasAppName}'
            }
            {
              name: 'FACTURACION_SERVICE_URL'
              value: 'http://${facturacionAppName}'
            }
          ]
          probes: [
            {
              type: 'Startup'
              httpGet: {
                path: '/'
                port: 80
                scheme: 'HTTP'
              }
              initialDelaySeconds: 5
              periodSeconds: 5
              failureThreshold: 10
              timeoutSeconds: 3
            }
            {
              type: 'Readiness'
              httpGet: {
                path: '/'
                port: 80
                scheme: 'HTTP'
              }
              initialDelaySeconds: 5
              periodSeconds: 10
              failureThreshold: 3
              timeoutSeconds: 3
            }
            {
              type: 'Liveness'
              httpGet: {
                path: '/'
                port: 80
                scheme: 'HTTP'
              }
              initialDelaySeconds: 10
              periodSeconds: 15
              failureThreshold: 3
              timeoutSeconds: 3
            }
          ]
        }
      ]
      scale: {
        minReplicas: minReplicas
        maxReplicas: maxReplicas
      }
    }
  }
}

// ==============================================================================
// OUTPUTS DEL DESPLIEGUE
// ==============================================================================

@description('FQDN público del frontend en Azure Container Apps')
output frontendFqdn string = frontendApp.properties.configuration.ingress.fqdn

@description('URL HTTPS pública directa para acceder a la aplicación')
output frontendUrl string = 'https://${frontendApp.properties.configuration.ingress.fqdn}'

@description('FQDN interno para clientes-service')
output clientesInternalFqdn string = clientesApp.properties.configuration.ingress.fqdn

@description('FQDN interno para productos-service')
output productosInternalFqdn string = productosApp.properties.configuration.ingress.fqdn

@description('FQDN interno para inventario-service')
output inventarioInternalFqdn string = inventarioApp.properties.configuration.ingress.fqdn

@description('FQDN interno para ventas-service')
output ventasInternalFqdn string = ventasApp.properties.configuration.ingress.fqdn

@description('FQDN interno para facturacion-service')
output facturacionInternalFqdn string = facturacionApp.properties.configuration.ingress.fqdn

@description('Dominio base del Container Apps Environment')
output environmentDefaultDomain string = containerAppsEnvironment.properties.defaultDomain
