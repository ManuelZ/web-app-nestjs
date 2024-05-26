## Docker build

Build the image:

```
docker build -f ./backend/Dockerfile --build-arg BACKEND_PORT=3000 -t backend:latest .
```

Test in a disposable local container:

```
docker run --rm -e DB_HOST="azuresql-server-for-nestjs.database.windows.net" -e DB_USERNAME="azureuser" -e DB_ROOT_PASSWORD="PASSWORD" -e DB_NAME="test" -e DB_PORT="1433" -e DB_SYNCHRONIZE="true" -p 3000:3000 -it backend:latest
```

### Upload the Docker image to an Azure Container Registry

Note: One standard Container Registry is included in the free 12 months free plan.

Create an Azure Container Registry:

```
az acr create --name <ACR_REGISTRY_NAME> --resource-group <RESOURCE_GROUP_NAME> --sku standard --admin-enabled true
```

Login to the registry:

```
az acr login --name <ACR_REGISTRY_NAME>
```

Tag the local image:

```
docker tag backend:latest <ACR_REGISTRY_NAME>.azurecr.io/backend:v1
```

Push the image to the container registry:

```
docker push <ACR_REGISTRY_NAME>.azurecr.io/backend:v1
```

### Upload to Azure App Service

Create a web app free service plan:

```
az appservice plan create --name <SERVICE_PLAN_NAME> --resource-group <RESOURCE_GROUP_NAME> --is-linux --sku F1
```

Create an app using Azure App Services:

```
az webapp create --resource-group <RESOURCE_GROUP_NAME> --plan <SERVICE_PLAN_NAME> --name <BACKEND_NAME> --container-image-name <ACR_REGISTRY_NAME>.azurecr.io/backend:v1
```

Retrieve the `id` of the user-assigned Managed Identity created earlier:

```
az identity show --resource-group <RESOURCE_GROUP_NAME> --name <USER_ASSIGNEED_MANAGED_ENTITY_NAME> --query id --output tsv
/subscriptions/xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx/resourcegroups/<RESOURCE_GROUP_NAME>/providers/Microsoft.ManagedIdentity/userAssignedIdentities/<USER_ASSIGNEED_MANAGED_ENTITY_NAME>
```

Assign the `id` of the user-assigned Managed Identity to the web app, so that it can pull a docker image from the Azure Container Registry:

```
az webapp identity assign --resource-group <RESOURCE_GROUP_NAME> --name <BACKEND_NAME>  --identities /subscriptions/xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx/resourcegroups/<RESOURCE_GROUP_NAME>/providers/Microsoft.ManagedIdentity/userAssignedIdentities/<USER_ASSIGNEED_MANAGED_ENTITY_NAME>
```

Retrieve the `id` of the web app configuration:

```
az webapp config show --resource-group <RESOURCE_GROUP_NAME> --name <BACKEND_NAME>  --query id --output tsv
/subscriptions/xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx/resourceGroups/<RESOURCE_GROUP_NAME>/providers/Microsoft.Web/sites/<BACKEND_NAME> /config/web
```

Retrieve the `clientId` of the user-assigned Managed Identity:

```
az identity show --resource-group <RESOURCE_GROUP_NAME> --name <USER_ASSIGNEED_MANAGED_ENTITY_NAME> --query clientId --output tsv
xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

Configure the app to pull from Azure Container Registry by using managed identities and set the `clientID` of the user-assigned Managed Identity that the web app will use to pull from Azure Container Registry:

```
az resource update --ids /subscriptions/xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx/resourceGroups/<RESOURCE_GROUP_NAME>/providers/Microsoft.Web/sites/<BACKEND_NAME> /config/web --set properties.acrUseManagedIdentityCreds=True --set properties.AcrUserManagedIdentityID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

To change the Docker image used in the app:

```
az webapp config container set --name <BACKEND_NAME> --resource-group <RESOURCE_GROUP_NAME> --container-image-name <ACR_REGISTRY_NAME>.azurecr.io/backend:v1
```

To add environment variables to a container:

```
az webapp config appsettings set --name <BACKEND_NAME> --resource-group <RESOURCE_GROUP_NAME> --settings DB_USERNAME=azureuser DB_ROOT_PASSWORD="PASSWORD" DB_NAME=test DB_PORT=1433 DB_HOST=azuresql-server-for-nestjs.database.windows.net DB_SYNCHRONIZE=true
```

App Service needs to know which port to forward requests to in the container, set `WEBSITES_PORT` for non-standard ports:

```
az webapp config appsettings set --resource-group <RESOURCE_GROUP_NAME> --name <BACKEND_NAME> --settings WEBSITES_PORT=3000
```
