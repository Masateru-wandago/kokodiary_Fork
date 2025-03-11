FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Copy package.json files for dependency installation
COPY package.json package-lock.json* ./
COPY backend/package.json ./backend/

# Install dependencies
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build the application
RUN npm run build:backend

# Production image, copy all the files and run node
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

# Create a non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 expressjs

# Copy built application
COPY --from=builder /app/backend/dist ./backend/dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/backend/package.json ./backend/

USER expressjs

EXPOSE 4000

ENV PORT 4000

# Start the application
CMD ["node", "backend/dist/index.js"]
