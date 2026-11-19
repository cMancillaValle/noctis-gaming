# Stage 1: Build
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Runtime
FROM nginx:alpine
COPY 10-resolve-dns.sh /docker-entrypoint.d/10-resolve-dns.sh
RUN chmod +x /docker-entrypoint.d/10-resolve-dns.sh
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/templates/default.conf.template
ENV CLIENTES_SERVICE_URL=http://clientes-service:8081 \
    PRODUCTOS_SERVICE_URL=http://productos-service:8082 \
    INVENTARIO_SERVICE_URL=http://inventario-service:8083 \
    VENTAS_SERVICE_URL=http://ventas-service:8084 \
    FACTURACION_SERVICE_URL=http://facturacion-service:8085 \
    NGINX_ENVSUBST_FILTER="^(CLIENTES_SERVICE_URL|PRODUCTOS_SERVICE_URL|INVENTARIO_SERVICE_URL|VENTAS_SERVICE_URL|FACTURACION_SERVICE_URL)$"
EXPOSE 80
HEALTHCHECK --interval=15s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:80/ || exit 1
CMD ["nginx", "-g", "daemon off;"]
