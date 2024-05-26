## Notes application

My Ensolvers-challenge solution, a minimalistic note taking application capable of:
 - Creating, editing and deleting notes
 - Archiving and unarchiving notes
 - Displaying active or archived notes

The application is composed of a MySql database, a backend based on NestJS and a React frontend. 
All are containerized with Docker and orchestrated through Docker-Compose.

## Requirements

To run, the application requires:

- Docker: v24.0
- Docker-Compose: v1.29

## How to run

In the root folder, run:

```
sudo ./run.sh
```

To access the application, open http://localhost:8000 in a browser.

## Versions

The database is:
- MySql: v8.4

The backend has been created using:
- Nestjs: v10.3
- Node: v22.2
- Npm: v10.7

The frontend has been created using:
- React: v18.2
- TailwindCSS: v3.4
- Node: v22.2
- Npm: v10.7



## Deploy the web app using Azure App Services

This is based on:
- https://learn.microsoft.com/en-us/azure/app-service/tutorial-custom-container
- https://learn.microsoft.com/en-us/cli/azure/sql/db?view=azure-cli-latest#az-sql-db-create
- https://learn.microsoft.com/en-us/azure/container-registry/container-registry-get-started-docker-cli?tabs=azure-cli 
- https://learn.microsoft.com/en-us/troubleshoot/azure/app-service/faqs-app-service-linux#how-do-i-specify-port-in-my-linux-container-

### Pre-requsites
Install the Azure CLI. These instructons were tested while using Azure CLI version 2.61.

Login to your Azure account:
```
az login
```

### Resource group and user-assigned Managed Identity

Create a resource group:
```
az group create --location westus --resource-group WebAppResourceGroup
```

Create a Managed Identity in the resource group:
```
az identity create --name WebAppUserAssignedManagedIdentity --resource-group WebAppResourceGroup
```


### Configure an Azure SQL database

Create a SQL server:
```
az sql server create --name azuresql-server-for-nestjs --resource-group WebAppResourceGroup --location westus --admin-user azureuser --admin-password PASSWORD
```

Create a firewall rule to be able to access the SQL server from all Azure-internal IP addresses:
```
az sql server firewall-rule create --resource-group WebAppResourceGroup --server azuresql-server-for-nestjs -n AllowYourIp --start-ip-address '0.0.0.0' --end-ip-address '0.0.0.0'
```


Create a serverless database, configured to use the free limits offered by Azure:
```
az sql db create --resource-group WebAppResourceGroup --server azuresql-server-for-nestjs --name test --edition GeneralPurpose --family Gen5 --capacity 2 --compute-model Serverless --use-free-limit --free-limit-exhaustion-behavior AutoPause
```

### Upload a Docker image to an Azure container registry

Note: One standard Container Registry is included in the free 12 months free plan.

Create an Azure Container Registry:
```
az acr create --name webappacrregistry --resource-group WebAppResourceGroup --sku standard --admin-enabled true
```

Login to the registry:
```
az acr login --name webappacrregistry
```

Tag the local image:
```
docker tag backend:latest webappacrregistry.azurecr.io/backend:v1
```

Push the image to the container registry:
```
docker push webappacrregistry.azurecr.io/backend:v1
```

### Configure the user-assigned Managed Identity to access the container registry:

Retrieve the `principalId` from the user-assigned Managed Identity:
```
az identity show --resource-group WebAppResourceGroup --name WebAppUserAssignedManagedIdentity --query principalId --output tsv
xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

Retrieve the resource `id` for the container registry:
```
az acr show --resource-group WebAppResourceGroup --name webappacrregistry --query id --output tsv
/subscriptions/xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx/resourceGroups/WebAppResourceGroup/providers/Microsoft.ContainerRegistry/registries/webappacrregistry
```

Grant the user-assigned Managed Identity permission to access the container registry:
```
az role assignment create --assignee xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx --scope /subscriptions/xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx/resourceGroups/WebAppResourceGroup/providers/Microsoft.ContainerRegistry/registries/webappacrregistry --role "AcrPull"
```


### Create NestJS API using Azure App Service

Create a web app free service plan:
```
az appservice plan create --name WebAppFreeServicePlan --resource-group WebAppResourceGroup --is-linux --sku F1
```

Create an app using Azure App Services:
```
az webapp create --resource-group WebAppResourceGroup --plan WebAppFreeServicePlan --name WebAppNestJS --container-image-name webappacrregistry.azurecr.io/backend:v1
```

Retrieve the `id` of the user-assigned Managed Identity created earlier:
```
az identity show --resource-group WebAppResourceGroup --name WebAppUserAssignedManagedIdentity --query id --output tsv
/subscriptions/xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx/resourcegroups/WebAppResourceGroup/providers/Microsoft.ManagedIdentity/userAssignedIdentities/WebAppUserAssignedManagedIdentity
```

Assign the `id` of the user-assigned Managed Identity to the web app, so that it can pull a docker image from the Azure Container Registry:
```
az webapp identity assign --resource-group WebAppResourceGroup --name WebAppNestJS  --identities /subscriptions/xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx/resourcegroups/WebAppResourceGroup/providers/Microsoft.ManagedIdentity/userAssignedIdentities/WebAppUserAssignedManagedIdentity
```

Retrieve the `id` of the web app configuration:
```
az webapp config show --resource-group WebAppResourceGroup --name WebAppNestJS  --query id --output tsv
/subscriptions/xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx/resourceGroups/WebAppResourceGroup/providers/Microsoft.Web/sites/WebAppNestJS /config/web
```

Retrieve the `clientId` of the user-assigned Managed Identity:
```
az identity show --resource-group WebAppResourceGroup --name WebAppUserAssignedManagedIdentity --query clientId --output tsv
xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

Configure the app to pull from Azure Container Registry by using managed identities and set the `clientID` of the user-assigned Managed Identity that the web app will use to pull from Azure Container Registry:
```
az resource update --ids /subscriptions/xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx/resourceGroups/WebAppResourceGroup/providers/Microsoft.Web/sites/WebAppNestJS /config/web --set properties.acrUseManagedIdentityCreds=True --set properties.AcrUserManagedIdentityID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

To change the Docker image used in the app:
```
az webapp config container set --name WebAppNestJS --resource-group WebAppResourceGroup --container-image-name webappacrregistry.azurecr.io/backend:v1
```

To add environment variables to a container:
```
az webapp config appsettings set --name WebAppNestJS --resource-group WebAppResourceGroup --settings DB_USERNAME=azureuser DB_ROOT_PASSWORD="PASSWORD" DB_NAME=test DB_PORT=1433 DB_HOST=azuresql-server-for-nestjs.database.windows.net DB_SYNCHRONIZE=true
```

App Service needs to know which port to forward requests to in the container, set WEBSITES_PORT for non-standard ports:
```
az webapp config appsettings set --resource-group WebAppResourceGroup --name WebAppNestJS --settings WEBSITES_PORT=3000 
```
