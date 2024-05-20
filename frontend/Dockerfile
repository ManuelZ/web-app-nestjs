FROM node:22-alpine3.18

RUN mkdir -p /app

WORKDIR /app

COPY frontend/package*.json ./
RUN npm install

COPY frontend/src ./src
COPY frontend/public ./
COPY frontend/index.html ./
COPY frontend/*.config.js ./

CMD [ "npm", "run", "dev"]