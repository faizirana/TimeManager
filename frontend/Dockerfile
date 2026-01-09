# Production Dockerfile for Frontend
# Multi-stage build with Next.js optimization

# Stage 1: Dependencies
FROM node:20-alpine AS deps
WORKDIR /app

# Install libc6-compat for Next.js compatibility
RUN apk add --no-cache libc6-compat

# Copy root package.json and workspace files
COPY package.json package-lock.json ./
COPY frontend/package.json ./frontend/

# Install dependencies
RUN npm ci --ignore-scripts

# Stage 2: Builder
FROM node:20-alpine AS builder
WORKDIR /app

RUN apk add --no-cache libc6-compat

# Copy dependencies
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/frontend/node_modules ./frontend/node_modules

# Copy application source
COPY frontend ./frontend
COPY package.json package-lock.json ./
COPY eslint.config.mjs ./

# Set environment for build
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Build Next.js application
WORKDIR /app/frontend
RUN npm run build

# Stage 3: Runner (Production)
FROM node:20-alpine AS runner
WORKDIR /app

RUN apk add --no-cache libc6-compat

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

# Copy necessary files from builder
COPY --from=builder /app/frontend/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/frontend/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/frontend/.next/static ./frontend/.next/static

# Set correct permissions
RUN chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Start Next.js production server
CMD ["node", "frontend/server.js"]
