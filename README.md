## Notes application

A demonstrative note-taking application capable of:
 - Creating, editing and deleting notes
 - Archiving and unarchiving notes
 - Displaying active or archived notes

The application is composed of:
 - An Azure SQL Database
 - A layered backend based on NestJS
 - A React frontend

Includes instructions to deploy the web app using Azure App Service.

## Technologies

Database: Azure SQL Database
Frontend: React and TailwindCSS, deployed using Azure Static Web Apps
Backend: Nestjs and Docker, deployed using Azure App Service

## Deploy the web app using Azure App Services

Based on:
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
az group create --location westus --resource-group <RESOURCE_GROUP_NAME>
```

Create a Managed Identity in the resource group:
```
az identity create --name <USER_ASSIGNEED_MANAGED_ENTITY_NAME> --resource-group <RESOURCE_GROUP_NAME>
```


### Configure an Azure SQL database

Create a SQL server:
```
az sql server create --name <DB_SERVER_NAME> --resource-group <RESOURCE_GROUP_NAME> --location westus --admin-user azureuser --admin-password PASSWORD
```

Create a firewall rule to be able to access the SQL server from all Azure-internal IP addresses:
```
az sql server firewall-rule create --resource-group <RESOURCE_GROUP_NAME> --server <DB_SERVER_NAME> -n AllowYourIp --start-ip-address '0.0.0.0' --end-ip-address '0.0.0.0'
```


Create a serverless database, configured to use the free limits offered by Azure:
```
az sql db create --resource-group <RESOURCE_GROUP_NAME> --server <DB_SERVER_NAME> --name <DB_NAME> --edition GeneralPurpose --family Gen5 --capacity 2 --compute-model Serverless --use-free-limit --free-limit-exhaustion-behavior AutoPause
```


### Configure the user-assigned Managed Identity to access the container registry:

Retrieve the `principalId` from the user-assigned Managed Identity:
```
az identity show --resource-group <RESOURCE_GROUP_NAME> --name <USER_ASSIGNEED_MANAGED_ENTITY_NAME> --query principalId --output tsv
xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

Retrieve the resource `id` for the container registry:
```
az acr show --resource-group <RESOURCE_GROUP_NAME> --name <ACR_REGISTRY_NAME> --query id --output tsv
/subscriptions/xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx/resourceGroups/<RESOURCE_GROUP_NAME>/providers/Microsoft.ContainerRegistry/registries/<ACR_REGISTRY_NAME>
```

Grant the user-assigned Managed Identity permission to access the container registry:
```
az role assignment create --assignee xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx --scope /subscriptions/xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx/resourceGroups/<RESOURCE_GROUP_NAME>/providers/Microsoft.ContainerRegistry/registries/<ACR_REGISTRY_NAME> --role "AcrPull"
```
