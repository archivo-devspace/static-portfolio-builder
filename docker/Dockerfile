# ----------------------------
# Stage 1: Dependencies
# ----------------------------
FROM node:20-alpine AS deps
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy lockfiles
COPY package.json pnpm-lock.yaml ./

# Install deps
RUN pnpm install --frozen-lockfile

# ----------------------------
# Stage 2: Builder
# ----------------------------
FROM node:20-alpine AS builder
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy node_modules
COPY --from=deps /app/node_modules ./node_modules

# Copy source
COPY . .

# Build Next.js
RUN pnpm build

# ----------------------------
# Stage 3: Runner
# ----------------------------
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Hardcode UID/GID for stability
RUN addgroup -g 101 nodejs && adduser -u 100 -G nodejs -S nextjs

# Make uploads folder
RUN mkdir -p /var/www/portfolios \
    && chown -R 100:101 /var/www/portfolios

# Switch to non-root user
USER nextjs

# Copy standalone build
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

EXPOSE 3000

CMD ["node", "server.js"]