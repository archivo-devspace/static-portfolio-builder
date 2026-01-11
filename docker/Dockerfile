# ----------------------------
# Stage 1: Dependencies
# ----------------------------
FROM node:20-alpine AS deps
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy lockfile (important!)
COPY package.json pnpm-lock.yaml ./

# Install deps (reproducible)
RUN pnpm install --frozen-lockfile

# ----------------------------
# Stage 2: Builder
# ----------------------------
FROM node:20-alpine AS builder
WORKDIR /app

# Install pnpm again (each stage is isolated)
RUN npm install -g pnpm

# Copy node_modules from deps
COPY --from=deps /app/node_modules ./node_modules

# Copy source code
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

# Use non-root user
RUN addgroup -S nodejs && adduser -S nextjs -G nodejs
USER nextjs

# Copy standalone output
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

EXPOSE 3000

CMD ["node", "server.js"]