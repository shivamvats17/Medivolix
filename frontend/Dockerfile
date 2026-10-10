# ==============================================================================
# Medivolix Frontend Dockerfile (Multi-stage Build)
# Stage 1: Build React 19 bundle using Node.js 20 Alpine
# Stage 2: Serve optimized static bundle and proxy API via Nginx Alpine
# ==============================================================================

# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependency manifests
COPY package*.json ./

# Install dependencies cleanly
RUN npm ci

# Copy frontend source code
COPY . .

# Build production bundle into /app/dist
RUN npm run build

# Stage 2: Runtime
FROM nginx:alpine

LABEL maintainer="Medivolix Engineering Team"
LABEL description="Medivolix React Frontend Production Web Server"

# Remove default nginx html
RUN rm -rf /usr/share/nginx/html/*

# Copy built distribution from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
