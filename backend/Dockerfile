# Production Dockerfile for Backend
# Multi-stage build to minimize final image size

# Stage 1: Dependencies
FROM node:18-alpine AS deps
WORKDIR /app

# Copy root package.json and workspace files
COPY package.json package-lock.json ./
COPY backend/package.json ./backend/

# Install all dependencies (needed for workspace setup)
RUN npm ci --ignore-scripts

# Stage 2: Builder
FROM node:18-alpine AS builder
WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy application source
COPY backend ./backend
COPY package.json package-lock.json ./

# Stage 3: Runner (Production)
FROM node:18-alpine AS runner
WORKDIR /app

# Install production dependencies + sequelize-cli for migrations
COPY package.json package-lock.json ./
COPY backend/package.json ./backend/
RUN npm ci --omit=dev --ignore-scripts && \
    npm install -g sequelize-cli && \
    npm cache clean --force

# Copy application files
COPY --from=builder /app/backend ./backend
COPY --from=builder /app/package.json ./
# Ensure .sequelizerc is present for sequelize-cli
COPY backend/.sequelizerc ./backend/.sequelizerc

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Set ownership
RUN chown -R nodejs:nodejs /app

USER nodejs

EXPOSE 3000

ENV NODE_ENV=production

# Run migrations and start server
CMD ["sh", "-c", "cd backend && npx sequelize-cli db:migrate && node server.js"]
