FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 8080

CMD ["sh", "-c", "cd frontend && npm install && npm run build && cd .. && npm run start:dev"]
