# ── Stage 1: Build ────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app/src

# Install deps first (cached layer)
COPY src/package*.json ./
RUN npm ci

# Copy source and build
COPY src/ .
RUN npm run build

# ── Stage 2: Production ───────────────────────────────────────────────────────
FROM node:20-alpine
WORKDIR /app/src
ENV NODE_ENV=production

# Install production deps only
COPY --from=builder /app/src/package*.json ./
RUN npm ci --omit=dev

# Copy built artifacts
COPY --from=builder /app/src/dist ./dist

EXPOSE 3000
CMD ["node", "dist/server.cjs"]
