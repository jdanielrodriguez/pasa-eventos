# ---- Etapa 1: build ----
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY nx.json ./
COPY tsconfig.base.json ./
COPY api ./api

RUN npm install

RUN npx nx build api

# ---- Etapa 2: imagen final ligera ----
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev

COPY --from=builder /app/dist/api ./dist

ENV NODE_ENV=production
ENV PORT=8080

EXPOSE 8080

CMD ["node", "dist/main.js"]
