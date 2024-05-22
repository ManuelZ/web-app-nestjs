FROM node:22-alpine3.18

RUN mkdir -p /app

WORKDIR /app

ARG BACKEND_PORT=3000
ENV BACKEND_PORT=$BACKEND_PORT

COPY backend/package*.json ./
RUN npm install

COPY backend/*.json ./
COPY backend/src ./

EXPOSE $BACKEND_PORT

CMD [ "npm", "run", "start"]