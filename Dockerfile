# syntax=docker/dockerfile:1

# ---- deps: install node_modules from the lockfile only ----------------------
FROM node:24.18.0-alpine AS deps
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

# ---- builder: compile the Next.js standalone output -------------------------
FROM node:24.18.0-alpine AS builder
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Opts this build into `output: "standalone"` — see next.config.ts. Without it
# the runner stage below has no .next/standalone to copy.
ENV BUILD_STANDALONE=1
RUN yarn build

# ---- runner: minimal image, only the standalone server ----------------------
FROM node:24.18.0-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0

RUN addgroup --system --gid 1001 nodejs \
 && adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
# standalone bundles its own trimmed node_modules and server.js
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
