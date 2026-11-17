# Guía de Integración con Microsoft Azure & Azure DevOps - Noctis Gaming

Este documento establece las instrucciones paso a paso para conectar la plataforma **Noctis Gaming** con los servicios de **Microsoft Azure** (Azure DevOps, Azure Container Registry, Azure Kubernetes Service, Azure Key Vault y Azure Monitor).

---

## 1. Arquitectura en Azure

```text
[ Developer / Git Push ]
           │
           ▼
[ Azure DevOps Pipelines ]
   ├── Stage 1: Maven & npm Build / Unit Tests
   ├── Stage 2: Quality & Dependency Checks
   ├── Stage 3: Docker Build & Push ───────────► [ Azure Container Registry (ACR) ]
   └── Stage 4: Deploy Manifests ──────────────► [ Azure Kubernetes Service (AKS) ]
                                                        ▲               ▲
                                                        │               │
                                           [ Azure Key Vault ]    [ Azure Monitor /
                                          (Secret Store CSI)     Application Insights]
```

---

## 2. Requisitos Previos en Azure

1. **Suscripción de Azure** activa.
2. **Organización y Proyecto en Azure DevOps** (`https://dev.azure.com/<tu-organizacion>/noctis-gaming`).
3. **Azure CLI** instalada (`az --version`).

---

## 3. Aprovisionamiento de Infraestructura

Para desplegar los recursos necesarios (ACR, AKS, Key Vault y Application Insights) con la plantilla Bicep provista:

```bash
# 1. Iniciar sesión en Azure
az login

# 2. Crear el Grupo de Recursos
az group create --name rg-noctis-prod --location eastus2

# 3. Desplegar los recursos mediante Bicep
az deployment group create \
  --resource-group rg-noctis-prod \
  --template-file infrastructure/azure/main.bicep \
  --parameters environmentName=prod
```

---

## 4. Configuración de Azure DevOps

### 4.1. Crear Service Connection de Azure Resource Manager
1. En tu proyecto de Azure DevOps, navega a **Project Settings > Service connections**.
2. Selecciona **New service connection > Azure Resource Manager > Service principal (automatic)**.
3. Elige tu suscripción y el grupo de recursos `rg-noctis-prod`.
4. Asigna el nombre `NoctisAzureServiceConnection` (este valor se usará en `AZURE_SUBSCRIPTION_ENDPOINT`).

### 4.2. Variable Groups en Azure DevOps Library
Crea un grupo de variables llamado `noctis-release-vars` con las siguientes entradas:

| Variable | Descripción | Ejemplo |
|---|---|---|
| `AZURE_SUBSCRIPTION_ENDPOINT` | Nombre de la Service Connection | `NoctisAzureServiceConnection` |
| `ACR_NAME` | Nombre del registro ACR creado | `acrnoctisprod` |
| `AKS_CLUSTER_NAME` | Nombre del clúster AKS | `aks-noctis-prod` |
| `AKS_RESOURCE_GROUP` | Grupo de recursos | `rg-noctis-prod` |
| `AZURE_KEY_VAULT_NAME` | Nombre de Key Vault | `kv-noctis-prod` |

---

## 5. Integración con Azure Key Vault

Almacenar los secretos de producción en Azure Key Vault:

```bash
# Registrar contraseñas y claves
az keyvault secret set --vault-name kv-noctis-prod --name "PostgresPassword" --value "<PASSWORD_ROBUSTA>"
az keyvault secret set --vault-name kv-noctis-prod --name "AdminApiKey" --value "<CLAVE_ADMIN_PRODUCCION>"
```

Los pods en AKS consumirán estos valores mediante el complemento nativo **Azure Key Vault Secrets Store CSI Driver** configurado en `main.bicep`.

---

## 6. Monitoreo y Observabilidad con Azure Monitor & Application Insights

Los microservicios cuentan con:
1. **Spring Boot Actuator**: expone `/actuator/health`, `/actuator/info` y `/actuator/metrics`.
2. **Filtro de Correlación (`X-Correlation-ID`)**: cada petición genera o propaga un identificador único que viaja a través de todos los microservicios y se registra en `MDC` para tracing distribuido.
3. **Application Insights Java Agent**:
   Para enviar telemetría nativa sin modificar código, agrega la variable de entorno en Kubernetes:
   ```yaml
   env:
     - name: APPLICATIONINSIGHTS_CONNECTION_STRING
       valueFrom:
         secretKeyRef:
           name: noctis-secrets
           key: APPLICATIONINSIGHTS_CONNECTION_STRING
     - name: JAVA_TOOL_OPTIONS
       value: "-javaagent:/app/applicationinsights-agent-3.5.0.jar"
   ```

---

## 7. Despliegue a Producción

Al fusionar cambios en la rama `main`, Azure Pipelines ejecutará automáticamente:
1. `mvn test` en todos los microservicios.
2. `npm run build` en el frontend.
3. Construcción de imágenes con tag de versión único (`1.0.$(Build.BuildId)`).
4. Publicación en Azure Container Registry (`acrnoctisprod.azurecr.io`).
5. Despliegue de los manifiestos en el namespace `noctis-gaming` de AKS.
