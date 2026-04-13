# Stage 1: Build frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /frontend
COPY frontend/package.json .
RUN npm install
COPY frontend/ .
RUN npm run build

# Stage 2: Backend + frontend
FROM node:20-alpine
RUN apk add --no-cache python3 make g++

WORKDIR /app
COPY backend/package.json .
RUN npm install

COPY backend/ .
COPY --from=frontend-builder /frontend/dist ./frontend/dist

RUN mkdir -p /app/data

EXPOSE 3000

CMD ["node", "server.js"]
