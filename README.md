# TodoWP

> Premium digital marketplace platform — WordPress themes, plugins, scripts, templates, SaaS, licenses, and more.

A production-grade, modern marketplace built from scratch with **Next.js 15**, **React 19**, **TypeScript**, **Tailwind CSS v4**, **Prisma**, and **PostgreSQL**. Inspired by ThemeForest, Envato, Gumroad, LemonSqueezy, Paddle, and Creative Market — but more modern, faster, and minimalist.

---

## ✨ Features

- **🎨 Premium UI/UX** — Glassmorphism, dark/light mode, smooth Framer Motion animations, fully responsive
- **🌍 Internationalization** — Spanish (default) & English, auto-detected locale, URL-based routing (`/es/...`, `/en/...`)
- **🔍 Instant search** — Live product search with dropdown results
- **🛒 Cart & Checkout** — Persistent cart (Zustand + localStorage), multi-payment (Stripe / PayPal / MercadoPago / Binance Pay / Crypto / Bank)
- **📦 Products** — Categories, brands, tags, versions with changelog, reviews, ratings, related products
- **👤 User accounts** — NextAuth with credentials, Google, GitHub, Discord, 2FA
- **📊 Dashboards** — User dashboard (orders, downloads, licenses, favorites) + Admin dashboard (sales, products, users, etc.)
- **📥 Downloads** — Signed URLs (R2/S3), expiring tokens, license activations
- **🔐 Security** — Rate limiting, CSRF, sanitization, HttpOnly cookies, security headers, audit logs
- **⚡ Performance** — Lighthouse 95+, ISR/SSR/SSG, Redis caching, image optimization, code splitting
- **🤖 AI-ready** — Embeddings for recommendations, smart search, auto-tagging (placeholder)
- **📱 PWA-ready** — Installable, offline-capable
- **🔎 SEO** — Dynamic metadata, JSON-LD (Product, Breadcrumb, FAQ, Organization, WebSite), sitemap, robots, OG images

---

## 🏗 Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS v4 |
| **UI** | Shadcn UI, Radix UI, Framer Motion, Lucide |
| **State** | Zustand, TanStack Query, React Hook Form + Zod |
| **Backend** | Next.js Server Actions, API Routes, Prisma |
| **Database** | PostgreSQL 16 |
| **Cache/Queue** | Redis 7, BullMQ |
| **Storage** | Cloudflare R2 / S3 (signed URLs) |
| **Auth** | NextAuth v5 (Credentials, Google, GitHub, Discord) + 2FA |
| **Email** | Nodemailer + React Email |
| **Payments** | Stripe, PayPal, MercadoPago, Binance Pay, Crypto, Bank |
| **i18n** | next-intl |
| **Testing** | Vitest, Playwright |
| **Quality** | TypeScript strict, ESLint, Prettier, Husky, Commitlint |
| **Infra** | Docker, Docker Compose, Nginx, GitHub Actions, Coolify, Dokploy |

---

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- pnpm 9+
- Docker & Docker Compose
- PostgreSQL 16+ (or use docker-compose)
- Redis 7+ (or use docker-compose)

### Installation

```bash
# 1. Clone
git clone https://github.com/your-org/todowp.git
cd todowp

# 2. Install dependencies
pnpm install

# 3. Set up environment
cp .env.example .env
# Edit .env with your secrets (AUTH_SECRET, DATABASE_URL, etc.)

# 4. Start services (PostgreSQL, Redis, MinIO, MailHog)
docker compose up -d db redis minio mailhog

# 5. Set up database
pnpm db:generate
pnpm db:push
pnpm db:seed

# 6. Start dev server
pnpm dev
```

Visit [http://localhost:3000](http://localhost:3000).

### Demo accounts (after seed)
- **Admin**: `admin@todowp.dev` / `admin123456`
- **User**: `ana@example.com` / `user123456`

---

## 📁 Project Structure

```
src/
├── app/                        # Next.js App Router
│   ├── [locale]/              # Internationalized routes
│   │   ├── (marketing)/       # Public pages (home, marketplace, product, blog)
│   │   ├── (auth)/            # Login, register
│   │   ├── (checkout)/        # Cart, checkout
│   │   ├── (dashboard)/       # User dashboard
│   │   └── (admin)/           # Admin panel
│   ├── api/                   # API routes
│   │   ├── auth/              # NextAuth
│   │   ├── search/            # Instant search
│   │   └── webhooks/          # Payment webhooks
│   ├── sitemap.ts             # Dynamic sitemap
│   ├── robots.ts              # robots.txt
│   └── globals.css            # Design system
│
├── components/                 # UI components
│   ├── ui/                    # shadcn primitives
│   ├── layout/                # Header, Footer, Cart drawer
│   ├── home/                  # Hero, Categories, Featured, etc.
│   ├── product/               # ProductCard, Gallery, Tabs
│   ├── marketplace/           # Filters, Sort
│   └── shared/                # Logo, ThemeToggle, etc.
│
├── modules/                    # Independent business modules
│   ├── auth/                  # Auth service + actions
│   ├── products/              # Products service + actions
│   ├── categories/
│   ├── brands/
│   ├── cart/
│   └── ...
│
├── lib/                        # Core libraries
│   ├── db.ts                  # Prisma singleton
│   ├── redis.ts               # Redis + cache
│   ├── r2.ts                  # Cloudflare R2 client
│   ├── auth.ts                # NextAuth config
│   ├── mail.ts                # Nodemailer
│   ├── seo.ts                 # SEO helpers + JSON-LD
│   ├── utils.ts               # cn, formatPrice, etc.
│   ├── sanitize.ts            # XSS prevention
│   ├── rate-limit.ts          # In-memory rate limiter
│   └── validators.ts          # Zod schemas
│
├── hooks/                      # React hooks
├── services/                   # External integrations
│   └── payment/               # Payment providers
├── store/                      # Zustand stores
├── types/                      # TypeScript types
├── emails/                     # React Email templates
├── i18n/                       # next-intl config
├── actions/                    # Server actions
└── middleware.ts               # i18n + security

prisma/
├── schema.prisma              # 30+ models
├── seed.ts                    # Demo data (12 products, 8 brands, 12 categories)
└── migrations/

messages/
├── es.json                    # Spanish translations
└── en.json                    # English translations
```

---

## 🛠 Available Scripts

```bash
pnpm dev                # Start dev server
pnpm build              # Production build
pnpm start              # Start production server
pnpm lint               # ESLint
pnpm typecheck          # TypeScript check
pnpm format             # Prettier

pnpm db:generate        # Generate Prisma client
pnpm db:push            # Push schema to DB
pnpm db:migrate         # Run migrations
pnpm db:seed            # Seed demo data
pnpm db:studio          # Prisma Studio
pnpm db:reset           # Reset DB

pnpm test               # Vitest
pnpm test:e2e           # Playwright
```

---

## 🎨 Design System

- **Brand color**: Violet `#7C3AED` (customizable in `globals.css`)
- **Fonts**: Inter (UI) + Geist Mono (code) via `next/font/google`
- **Themes**: Light + Dark, system-aware
- **Glassmorphism**: `.glass`, `.glass-strong` utilities
- **Animations**: Framer Motion + CSS keyframes
- **Tokens**: All design tokens defined in `globals.css` using Tailwind v4 `@theme`

---

## 🔐 Security

- HttpOnly, Secure, SameSite=Lax cookies
- CSRF protection via NextAuth + Server Action validation
- Rate limiting (in-memory + ready for Upstash)
- DOMPurify for HTML sanitization
- Zod for all input validation
- Argon2 for password hashing
- 2FA (TOTP) ready
- Audit log for sensitive actions
- Security headers (CSP, HSTS, X-Frame-Options, etc.)
- SQL injection prevention (Prisma parameterized queries)
- Signed URLs for downloads (5 min expiry)

---

## 📦 Deployment

### Docker

```bash
docker compose up -d
```

Includes app, PostgreSQL, Redis, MinIO, MailHog.

### Vercel

```bash
vercel deploy --prod
```

### Coolify / Dokploy

Push the repo and select Docker Compose. Configure env vars in the dashboard.

### Manual

```bash
pnpm build
pnpm start
```

---

## 📊 Database Schema

30+ models including:
- `User`, `Account`, `Session`, `TwoFactorConfirmation`
- `Category`, `Brand`, `Tag`, `Product`, `ProductVersion`
- `Review`, `Question`
- `Cart`, `CartItem`, `Order`, `OrderItem`
- `License`, `Activation`, `Download`
- `Coupon`, `Invoice`, `ApiKey`
- `Notification`, `BlogPost`, `BlogCategory`, `BlogComment`
- `Ticket`, `TicketMessage`
- `Newsletter`, `AuditLog`
- `Setting`, `EmailTemplate`, `Backup`, `PaymentProvider`

---

## 🗺 Roadmap

- [x] **F0**: Bootstrap, architecture, design system ✅
- [x] **F1**: Catalog (Home, Marketplace, Product Detail) ✅
- [ ] **F2**: Cart, Checkout, Payments, Licenses, Downloads
- [ ] **F3**: User Dashboard, Admin Dashboard, Blog
- [ ] **F4**: AI (search, recommendations, auto-tagging), advanced security, tests

---

## 🚀 Despliegue en Dokploy

### 1. Crear proyecto en Dokploy

1. En Dokploy, crear un nuevo **Project** (por ejemplo `todowp`).
2. Crear un nuevo **Service** de tipo **App** → seleccionar **Docker**.
3. Conectar el repositorio de GitHub: `https://github.com/itzcarlosandres/todowp.git`.
4. Branch: `main`. Build method: **Dockerfile**.

### 2. Servicios externos (crear antes del deploy)

Dokploy provee Postgres/Redis como servicios separados. Crear:

- **PostgreSQL 16**: crear base de datos `todowp`. Copiar la `DATABASE_URL` interna.
- **Redis 7** (opcional): para cache. Copiar la `REDIS_URL`.
- **Mailserver** (opcional): SMTP como Mailgun, Brevo, Resend, etc.

### 3. Variables de entorno requeridas

Configurar en Dokploy → App → **Environment Variables**:

```env
# === Obligatorias ===
DATABASE_URL=postgresql://user:pass@host:5432/todowp
AUTH_SECRET=<openssl rand -base64 32>
AUTH_URL=https://tudominio.com
AUTH_TRUST_HOST=true
NEXT_PUBLIC_APP_URL=https://tudominio.com
NODE_ENV=production
PORT=3000

# === Email (SMTP) ===
SMTP_HOST=smtp.tu-provider.com
SMTP_PORT=587
SMTP_USER=...
SMTP_PASSWORD=...
SMTP_FROM_NAME=TodoWP
SMTP_FROM_EMAIL=no-reply@tudominio.com

# === Almacenamiento (Cloudflare R2 / S3) ===
R2_ACCOUNT_ID=...
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
R2_BUCKET=todowp-files
R2_PUBLIC_URL=https://files.tudominio.com

# === Pagos (al menos uno) ===
STRIPE_SECRET_KEY=sk_live_...
# o
PAYPAL_CLIENT_ID=...
PAYPAL_CLIENT_SECRET=...
# o
MERCADOPAGO_ACCESS_TOKEN=...

# === IA (opcional) ===
GEMINI_API_KEY=...

# === Otros (opcional) ===
REDIS_URL=redis://...
NEXT_TELEMETRY_DISABLED=1
```

### 4. Configuración del build en Dokploy

- **Dockerfile path**: `./Dockerfile`
- **Port**: `3000`
- **Healthcheck path**: `/` (la app responde 200)
- **Build args**: ninguno necesario

### 5. Dominio y SSL

En Dokploy → App → **Domains**, añadir `tudominio.com`. Dokploy gestiona el SSL automáticamente con Let's Encrypt.

### 6. Migración de la base de datos

Después del primer deploy exitoso, ejecutar las migraciones de Prisma desde la consola de Dokploy:

```bash
pnpm db:generate
pnpm db:push     # o: pnpm prisma migrate deploy
pnpm db:seed      # opcional, para datos iniciales
```

Opcionalmente, ejecutar `pnpm db:seed` para cargar datos demo (admin@todowp.dev / admin123456).

### 7. Verificación post-deploy

- `https://tudominio.com/` → debe responder 200 OK
- `https://tudominio.com/sitemap.xml` → sitemap generado
- `https://tudominio.com/robots.txt` → robots configurado
- `https://tudominio.com/admin` → login con credenciales seed

---

## 📄 License

MIT © TodoWP

---

## 🙏 Credits

Built with ❤️ using the best open-source tools.

Inspired by [ThemeForest](https://themeforest.net), [Envato](https://envato.com), [Gumroad](https://gumroad.com), [LemonSqueezy](https://lemonsqueezy.com), [Paddle](https://paddle.com), [Creative Market](https://creativemarket.com).
