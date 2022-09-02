FROM node:12.21-stretch-slim

WORKDIR /app

COPY package.json ./

RUN npm install

COPY . .

CMD ["node", "src/index.js"]


