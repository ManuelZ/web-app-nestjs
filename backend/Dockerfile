FROM node:22-alpine3.18

RUN mkdir -p /app

WORKDIR /app

COPY backend/package*.json ./
RUN npm install

COPY backend/*.json ./
COPY backend/src ./

CMD [ "npm", "run", "start"]