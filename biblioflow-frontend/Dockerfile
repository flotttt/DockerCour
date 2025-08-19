# ===== DOCKERFILE FRONTEND ANGULAR - MULTI-STAGE =====

# ===== STAGE BASE =====
FROM node:22-alpine AS base
RUN apk add --no-cache git curl
WORKDIR /app
COPY package*.json ./
RUN npm ci --cache /tmp/empty-cache && npm cache clean --force

# ===== STAGE DÉVELOPPEMENT =====
FROM base AS dev
# Installation des dépendances de développement
RUN npm ci
COPY . .
EXPOSE 4200
ENV CHOKIDAR_USEPOLLING=1
ENV NG_CLI_ANALYTICS=false
# Commande par défaut pour le développement
CMD ["npx", "ng", "serve", "--host", "0.0.0.0", "--port", "4200", "--poll", "2000"]

# ===== STAGE BUILD =====
FROM base AS builder
# Copier tout le code source
COPY . .
# Build de production optimisé
RUN npx ng build --configuration=production --output-path=/app/dist/biblioflow-frontend
# Vérification que les fichiers sont bien générés
RUN ls -la /app/dist/biblioflow-frontend/

# ===== STAGE PRODUCTION =====
FROM nginx:alpine AS production
# Installation d'outils nécessaires
RUN apk add --no-cache curl

# Copier la configuration Nginx
COPY nginx.conf /etc/nginx/nginx.conf

# Supprimer les fichiers par défaut et copier l'app
RUN rm -rf /usr/share/nginx/html/*
COPY --from=builder /app/dist/biblioflow-frontend /usr/share/nginx/html/

# Vérification que index.html existe
RUN ls -la /usr/share/nginx/html/ && \
    test -f /usr/share/nginx/html/index.html || (echo "ERROR: index.html not found!" && exit 1)

# Permissions correctes
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chmod -R 755 /usr/share/nginx/html

# Port d'exposition
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:80 || exit 1

# Commande par défaut
CMD ["nginx", "-g", "daemon off;"]
