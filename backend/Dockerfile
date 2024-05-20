FROM node:alpine3.11

RUN mkdir -p /app

WORKDIR /app

COPY backend/package*.json ./
RUN npm install

COPY backend/*.json ./
COPY backend/src ./

# Don't forget to delete this
COPY backend/.env ./

CMD [ "npm", "run", "start"]