FROM node:22-alpine AS builder

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build

FROM node:22-alpine AS production

RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm ci --only=production && npm cache clean --force

COPY --from=builder /usr/src/app/dist ./dist

RUN chown -R nestjs:nodejs /usr/src/app
USER nestjs

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/books || exit 1

CMD ["node", "dist/main"]