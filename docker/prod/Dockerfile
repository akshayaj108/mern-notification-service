# syntax=docker/dockerfile:1
# Build stage
FROM node:26-bookworm-slim AS builder

WORKDIR /app

# Copy package files first for better layer caching
COPY package*.json ./

# Install all dependencies, including dev dependencies Reuses the npm download cache between builds.Avoids downloading previously cached packages unnecessarily.
RUN --mount=type=cache,target=/root/.npm HUSKY=0 npm ci

# Copy application source
COPY . .

RUN npm run build 

# Production dependencies stage
FROM builder AS production-deps

ENV NODE_ENV=production

# Remove development dependencies
RUN npm prune --omit=dev



# Production stage
FROM node:26-bookworm-slim AS production

WORKDIR /app

ENV NODE_ENV=production

# Copy production dependencies
COPY --from=production-deps --chown=node:node /app/node_modules ./node_modules

# Copy compiled application
COPY --from=builder --chown=node:node /app/dist/ ./

# Copy package.json (needed for package metadata and ESM configuration)
COPY --from=builder --chown=node:node /app/package.json ./package.json

# # Copy public assets (JWKS)
# COPY --from=builder --chown=node:node /app/public/ ./public/

# Run application as non-root user
USER node

EXPOSE 5501

CMD [ "node", "server.js" ]
