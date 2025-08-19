# ===== Stage DEV =====
FROM node:22-alpine AS dev
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
ENV CHOKIDAR_USEPOLLING=1
EXPOSE 4200
CMD ["npx", "ng", "serve", "--host", "0.0.0.0", "--port", "4200", "--poll=2000"]

# ===== Stage BUILD =====
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --silent
COPY . .
RUN npx ng build --configuration=production

# ===== Stage PRODUCTION =====
FROM nginx:alpine AS prod
RUN apk add --no-cache curl
RUN rm -rf /usr/share/nginx/html/*
COPY --from=builder /app/dist/biblioflow-frontend /usr/share/nginx/html/
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:80 || exit 1
CMD ["nginx", "-g", "daemon off;"]
