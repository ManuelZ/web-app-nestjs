## Deploy to Azure

Install SWA CLI:

```
npm install -D @azure/static-web-apps-cli
```

Retrieve the backend url:

```
az webapp show --resource-group <RESOURCE_GROUP_NAME> -n webappnestjs --query defaultHostName --output tsv
```

Build the project:

```
set VITE_BACKEND_URL=<BACKEND_URL>
npm run build
```

Create a free static web app:

```
az staticwebapp create --name WebAppReact --resource-group <RESOURCE_GROUP_NAME> --app-location . --sku Free
```

Show web app deployment token:

```
az staticwebapp secrets list --name WebAppReact --query "properties.apiKey"
```

Deploy the app:

```
SWA_CLI_DEPLOYMENT_TOKEN=<DEPLOYMENT_TOKEN>
swa deploy --env production ./dist
```

Note: deploying from inside the `dist` folder errors out silently.
