FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Copy package.json files for dependency installation
COPY package.json package-lock.json* ./
COPY frontend/package.json ./frontend/
COPY backend/package.json ./backend/

# Install dependencies
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build the application
RUN npm run build

# Production image, copy all the files and run node
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

# Create a non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 appuser

# Copy built applications
# Frontend
COPY --from=builder /app/frontend/public ./frontend/public
COPY --from=builder --chown=appuser:nodejs /app/frontend/.next/standalone ./
COPY --from=builder --chown=appuser:nodejs /app/frontend/.next/static ./frontend/.next/static

# Backend
COPY --from=builder /app/backend/dist ./backend/dist
COPY --from=builder /app/backend/package.json ./backend/

# Copy node_modules
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./

USER appuser

EXPOSE 3000 4000

# Start script to run both services
COPY --chown=appuser:nodejs docker-entrypoint.sh ./
RUN chmod +x ./docker-entrypoint.sh

CMD ["./docker-entrypoint.sh"]
