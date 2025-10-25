# ============================================
# Stage 1: Build Frontend
# ============================================
FROM node:22-alpine AS web-builder

WORKDIR /build/web

# Copy package files first (for Docker layer caching)
COPY apps/web/package*.json ./

# Install dependencies (including dev dependencies needed for build)
RUN npm ci

# Copy build configuration files
COPY apps/web/tsconfig*.json ./
COPY apps/web/vite.config.ts ./
COPY apps/web/index.html ./

# Copy source code
COPY apps/web/src ./src
COPY apps/web/public ./public

# Build frontend → output: dist/ folder with static files
RUN npm run build

# ============================================
# Stage 2: Build Backend
# ============================================
FROM node:22-alpine AS api-builder

WORKDIR /build/api

# Copy package files first (for Docker layer caching)
COPY apps/api/package*.json ./
COPY apps/api/tsconfig.json ./

# Install dependencies (including dev dependencies for TypeScript compiler)
RUN npm ci

# Copy source code
COPY apps/api/src ./src

# Build backend → output: dist/ folder with compiled JavaScript
RUN npm run build

# ============================================
# Stage 3: Production Runtime
# ============================================
FROM node:22-alpine AS production

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

WORKDIR /app

# Copy package.json and install ONLY production dependencies
COPY apps/api/package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Copy compiled backend from api-builder stage
COPY --from=api-builder /build/api/dist ./dist

# Copy built frontend from web-builder stage
COPY --from=web-builder /build/web/dist ./public

# Create directory for SQLite database (use volume in production)
RUN mkdir -p /app/data && chown -R node:node /app

# Switch to non-root user for security
USER node

# Environment
ENV NODE_ENV=production

# Expose port
EXPOSE 3000

# Health check - Docker will mark container unhealthy if this fails
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => process.exit(r.statusCode === 200 ? 0 : 1))"

# Start application with dumb-init for proper signal handling
CMD ["dumb-init", "node", "dist/main.js"]