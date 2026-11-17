// ==============================================================================
// NOCTIS GAMING - INFRAESTRUCTURA COMO CÓDIGO (Bicep / Azure Resource Manager)
// ==============================================================================

@description('Prefijo para nombres de recursos')
param environmentName string = 'prod'

@description('Ubicación de despliegue en Azure')
param location string = resourceGroup().location

@description('Nombre de Azure Container Registry (debe ser único a nivel global)')
param acrName string = 'acrnoctis${uniqueString(resourceGroup().id)}'

@description('Nombre del clúster Azure Kubernetes Service (AKS)')
param aksClusterName string = 'aks-noctis-${environmentName}'

@description('Nombre de Azure Key Vault')
param keyVaultName string = 'kv-noctis-${uniqueString(resourceGroup().id)}'

// 1. Log Analytics Workspace (Para Azure Monitor y Application Insights)
resource logAnalytics 'Microsoft.OperationalInsights/workspaces@2022-10-01' = {
  name: 'law-noctis-${environmentName}'
  location: location
  properties: {
    sku: {
      name: 'PerGB2018'
    }
    retentionInDays: 30
  }
}

// 2. Application Insights (APM y Observabilidad)
resource appInsights 'Microsoft.Insights/components@2020-02-02' = {
  name: 'appi-noctis-${environmentName}'
  location: location
  kind: 'web'
  properties: {
    Application_Type: 'web'
    WorkspaceResourceId: logAnalytics.id
  }
}

// 3. Azure Container Registry (ACR)
resource acr 'Microsoft.ContainerRegistry/registries@2023-07-01' = {
  name: acrName
  location: location
  sku: {
    name: 'Standard'
  }
  properties: {
    adminUserEnabled: false
  }
}

// 4. Azure Key Vault (Gestión segura de credenciales)
resource keyVault 'Microsoft.KeyVault/vaults@2023-07-01' = {
  name: keyVaultName
  location: location
  properties: {
    sku: {
      family: 'A'
      name: 'standard'
    }
    tenantId: subscription().tenantId
    enableRbacAuthorization: true
    enableSoftDelete: true
  }
}

// 5. Azure Kubernetes Service (AKS)
resource aks 'Microsoft.ContainerService/managedClusters@2024-02-01' = {
  name: aksClusterName
  location: location
  identity: {
    type: 'SystemAssigned'
  }
  properties: {
    dnsPrefix: 'noctis-k8s'
    agentPoolProfiles: [
      {
        name: 'systempool'
        count: 2
        vmSize: 'Standard_D2s_v5'
        osType: 'Linux'
        mode: 'System'
      }
    ]
    addonProfiles: {
      omsagent: {
        enabled: true
        config: {
          logAnalyticsWorkspaceResourceID: logAnalytics.id
        }
      }
      azureKeyvaultSecretsProvider: {
        enabled: true
      }
    }
  }
}

// 6. Asignación de Rol AcrPull para que AKS pueda descargar imágenes de ACR
var acrPullRoleDefinitionId = subscriptionResourceId('Microsoft.Authorization/roleDefinitions', '7f951dda-4ed3-4680-a7ca-43fe172d538d')

resource aksAcrPullRoleAssignment 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  name: guid(resourceGroup().id, aks.id, acrPullRoleDefinitionId)
  scope: acr
  properties: {
    principalId: aks.properties.identityProfile.kubeletidentity.objectId
    roleDefinitionId: acrPullRoleDefinitionId
    principalType: 'ServicePrincipal'
  }
}

output acrLoginServer string = acr.properties.loginServer
output aksClusterNameOutput string = aks.name
output keyVaultUri string = keyVault.properties.vaultUri
output appInsightsConnectionString string = appInsights.properties.ConnectionString
