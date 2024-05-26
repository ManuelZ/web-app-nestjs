## Docker build

Build the image:

```
docker build -f ./backend/Dockerfile --build-arg BACKEND_PORT=3000 -t backend:latest .
```

Add a new tag to the image:

```
docker tag backend:latest manuelacregistry.azurecr.io/backend:v3
```

Login to the registry:

```
az acr login --name manuelacregistry
```

Push the image to the registry:

```
docker push manuelacregistry.azurecr.io/backend:v3
```

Test in a disposable local container:

```
docker run --rm -e DB_HOST="azuresql-server-for-nestjs.database.windows.net" -e DB_USERNAME="azureuser" -e DB_ROOT_PASSWORD="PASSWORD" -e DB_NAME="test" -e DB_PORT="1433" -e DB_SYNCHRONIZE="true" -p 3000:3000 -it backend:latest
```
