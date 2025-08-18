FROM node:22-alpine AS dev
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
ENV CHOKIDAR_USEPOLLING=1
EXPOSE 4200
CMD ["npx", "ng", "serve", "--host", "0.0.0.0", "--port", "4200"]
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx ng build --configuration=production --output-path=/app/dist
FROM nginx:alpine AS prod
RUN rm -rf /usr/share/nginx/html/*
COPY --from=builder /app/dist/ /usr/share/nginx/html/
RUN if [ ! -f /usr/share/nginx/html/index.html ]; then \
      find /usr/share/nginx/html -name "index.html" -exec cp {} /usr/share/nginx/html/ \; || \
      echo "<!DOCTYPE html><html><body><h1>Angular files not found</h1></body></html>" > /usr/share/nginx/html/index.html; \
    fi
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
