FROM node:lts

WORKDIR /app

COPY package.json ./

RUN npm install

COPY . .

EXPOSE 5052

CMD ["node", "src/index.js"]


