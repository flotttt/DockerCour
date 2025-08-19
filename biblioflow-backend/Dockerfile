# ===== DOCKERFILE BACKEND NESTJS - MULTI-STAGE PRODUCTION =====

# ===== STAGE BASE =====
FROM node:22-alpine AS base
RUN apk add --no-cache curl bash git
WORKDIR /usr/src/app
COPY package*.json ./

# ===== STAGE DEPENDENCIES =====
FROM base AS deps
RUN npm ci --only=production && npm cache clean --force

# ===== STAGE BUILD =====
FROM base AS build
RUN npm ci
COPY . .
RUN npm run build
RUN npm prune --production

# ===== STAGE PRODUCTION =====
FROM node:22-alpine AS production

# Création utilisateur non-root pour sécurité
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001 -G nodejs

# Installation des dépendances système minimales
RUN apk add --no-cache curl

WORKDIR /usr/src/app

# Copie des dépendances et du code compilé
COPY --from=deps /usr/src/app/node_modules ./node_modules
COPY --from=build /usr/src/app/dist ./dist
COPY --from=build /usr/src/app/package*.json ./

# Script de health check
COPY healthcheck.js ./

# Changement de propriétaire
RUN chown -R nestjs:nodejs /usr/src/app

# Changement vers utilisateur non-root
USER nestjs

# Port d'exposition
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD node healthcheck.js || exit 1

# Commande par défaut
CMD ["node", "dist/main.js"]