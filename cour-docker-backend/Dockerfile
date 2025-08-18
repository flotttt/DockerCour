# Production Dockerfile pour Nest.js
FROM node:22-alpine AS builder

WORKDIR /usr/src/app

# Copier package files
COPY package*.json ./

# Installer toutes les dépendances (y compris dev pour le build)
RUN npm ci

# Copier le code source
COPY . .

# Compiler l'application
RUN npm run build

# Stage production
FROM node:22-alpine AS production

WORKDIR /usr/src/app

# Copier package files
COPY package*.json ./

# Installer UNIQUEMENT les dépendances de production
RUN npm ci --only=production && npm cache clean --force

# Copier l'application compilée
COPY --from=builder /usr/src/app/dist ./dist

# Créer utilisateur non-root pour la sécurité
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001

# Changer les permissions
RUN chown -R nestjs:nodejs /usr/src/app
USER nestjs

# Exposer le port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/ || exit 1

# Démarrer l'application (version compilée)
CMD ["node", "dist/main"]