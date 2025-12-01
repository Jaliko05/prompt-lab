# Etapa 1: Build
FROM node:20-alpine AS builder

# Build arguments para variables de entorno
ARG VITE_API_BASE_URL
ARG VITE_ADMIN_API_KEY

# Instalar pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Establecer directorio de trabajo
WORKDIR /app

# Copiar archivos de dependencias
COPY package.json pnpm-lock.yaml ./

# Instalar dependencias
RUN pnpm install --frozen-lockfile

# Copiar el resto del código
COPY . .

# Establecer variables de entorno para el build
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}
ENV VITE_ADMIN_API_KEY=${VITE_ADMIN_API_KEY}

# Build de la aplicación
RUN pnpm run build

# Etapa 2: Producción con Nginx
FROM nginx:alpine AS production

# Copiar archivos estáticos desde el build
COPY --from=builder /app/dist /usr/share/nginx/html

# Copiar configuración personalizada de nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Crear script para inyectar variables de entorno en runtime
RUN echo '#!/bin/sh' > /docker-entrypoint.sh && \
    echo 'set -e' >> /docker-entrypoint.sh && \
    echo 'echo "Starting Nginx..."' >> /docker-entrypoint.sh && \
    echo 'exec nginx -g "daemon off;"' >> /docker-entrypoint.sh && \
    chmod +x /docker-entrypoint.sh

# Exponer puerto 80
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost/ || exit 1

# Comando para iniciar nginx
ENTRYPOINT ["/docker-entrypoint.sh"]
