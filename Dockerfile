# ---- Etapa 1: build ----
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY nx.json ./
COPY tsconfig.base.json ./
COPY api ./api
COPY frontend ./frontend

RUN npm install

# Build backend
RUN npx nx build api

# Build Angular SSR (browser + server)
WORKDIR /app/frontend
RUN npm install
RUN npm run build

# ---- Etapa 2: imagen final ligera ----
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev

# Copia backend build
COPY --from=builder /app/dist/api ./dist

# Copia SSR de Angular (browser y server)
COPY --from=builder /app/frontend/dist/frontend ./dist/frontend

ENV NODE_ENV=production
ENV PORT=8080

EXPOSE 8080

CMD ["node", "dist/main.js"]
