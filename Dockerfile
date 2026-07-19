# =====================================================
# Dockerfile multi-stage para TodoWP (Next.js 15)
# Optimizado para Dokploy / producción
# =====================================================

# ---- Stage 1: deps ----
FROM node:22-alpine AS deps
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app
COPY package.json pnpm-lock.yaml* .npmrc* ./
RUN corepack enable && pnpm install --frozen-lockfile

# ---- Stage 2: builder ----
FROM node:22-alpine AS builder
RUN apk add --no-cache openssl
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
# Placeholder para que Prisma valide el schema. El valor real se provee en runtime.
ENV DATABASE_URL="postgresql://placeholder:placeholder@localhost:5432/placeholder?schema=public"
ENV SHADOW_DATABASE_URL="postgresql://placeholder:placeholder@localhost:5432/placeholder_shadow?schema=public"
ENV AUTH_SECRET="placeholder-secret-for-build-only-not-used-at-runtime"
ENV AUTH_URL="http://localhost:3000"
ENV NEXTAUTH_URL="http://localhost:3000"
# Generar cliente Prisma (sin internet, usa el schema local)
RUN corepack enable && pnpm db:generate
# Build de Next.js con output standalone
RUN pnpm build

# ---- Stage 3: runner (imagen final mínima) ----
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Paquetes del sistema
RUN apk add --no-cache openssl curl bash
# Instalar pnpm globalmente para poder correr prisma y tsx desde el contenedor
RUN corepack enable && corepack prepare pnpm@10.13.1 --activate
# Usuario no-root para seguridad
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copiar artefactos del build
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
# El output standalone se copia desde /app/.next/standalone
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
# Prisma necesita el schema y los binarios del query engine
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/.prisma ./node_modules/.prisma
# node_modules de Prisma para runtime
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/@prisma ./node_modules/@prisma

# Instalar prisma y tsx globalmente para poder correr migraciones
# desde la terminal del contenedor
USER root
RUN npm install -g prisma@6.19.3 tsx@4.19.2 slugify argon2
USER nextjs

USER nextjs
EXPOSE 3000

# CMD directo con paths absolutos para evitar problemas de PATH o shell
CMD ["node", "server.js"]
