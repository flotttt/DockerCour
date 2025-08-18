# Production Dockerfile pour Angular
FROM node:22-alpine AS builder

WORKDIR /app

# Copier package files
COPY package*.json ./

# Installer dépendances (optimisé pour production)
RUN npm ci --silent

# Copier le code source
COPY . .

# Compiler l'application pour la production
RUN npm run build

# Stage production avec Nginx
FROM nginx:alpine AS production

# Installer curl pour health checks
RUN apk add --no-cache curl

# SUPPRIMER la config par défaut nginx
RUN rm /etc/nginx/conf.d/default.conf

# Copier configuration Nginx personnalisée
COPY nginx.conf /etc/nginx/nginx.conf

# Copier l'application compilée
COPY --from=builder /app/dist/*/browser /usr/share/nginx/html

# Utiliser l'utilisateur nginx existant (pas besoin de le créer)
# Permissions sécurisées
RUN chown -R nginx:nginx /usr/share/nginx/html

# Exposer le port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8080 || exit 1

# Démarrer Nginx (fonctionne déjà avec l'utilisateur nginx)
CMD ["nginx", "-g", "daemon off;"]
