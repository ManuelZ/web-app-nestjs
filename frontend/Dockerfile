FROM node:alpine3.11

RUN mkdir -p /app

WORKDIR /app

COPY frontend/package*.json ./
RUN npm install

COPY frontend/src ./src
COPY frontend/public ./
COPY frontend/index.html ./
COPY frontend/*.config.js ./

CMD [ "npm", "run", "dev"]