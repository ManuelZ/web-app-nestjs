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


