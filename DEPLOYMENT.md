# Despliegue en Easypanel

Guía paso a paso para desplegar TodoWP en Easypanel.

## Requisitos previos

- Cuenta en [Easypanel](https://easypanel.io)
- Repositorio GitHub público o privado con el código
- (Opcional) Dominio propio para SSL personalizado

## 1. Preparar el repositorio

El repositorio ya incluye:
- `Dockerfile` multi-stage optimizado
- `next.config.ts` con `output: "standalone"`
- `.env.example` con todas las variables necesarias
- `.dockerignore` para reducir el tamaño de la imagen

## 2. Crear el proyecto en Easypanel

1. Entra a tu panel de Easypanel
2. Click en **"+ Create"** -> **"Project"**
3. Asigna un nombre (ej: `todowp`)
4. Selecciona tu servidor

## 3. Crear el servicio PostgreSQL

1. Dentro del proyecto, click en **"+ Create"** -> **"Service"** -> **"Database"** -> **"PostgreSQL"**
2. Configuración:
   - **Service Name**: `postgres`
   - **Image**: `postgres:16-alpine`
   - **Database Name**: `todowp`
   - **Username**: `postgres`
   - **Password**: genera uno seguro (guárdalo!)
3. Click **"Deploy"** y espera a que esté corriendo

Anota la contraseña, la necesitarás para `DATABASE_URL`.

## 4. Crear el servicio de la aplicación

1. Click en **"+ Create"** -> **"Service"** -> **"App"**
2. Selecciona **"GitHub"** como source
3. Conecta tu cuenta de GitHub si no lo has hecho
4. Selecciona el repositorio `itzcarlosandres/todowp`
5. Configuración:
   - **Service Name**: `app`
   - **Branch**: `main`
   - **Port**: `3000`
   - **Build Command**: (dejar vacío, usa el Dockerfile)
   - **Dockerfile Path**: `Dockerfile`

## 5. Configurar variables de entorno

En la sección **"Environment Variables"** del servicio `app`, agrega las siguientes variables (mínimas para arrancar):

```env
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://TU-DOMINIO.easypanel.host
NEXT_PUBLIC_APP_NAME=TodoWP
DATABASE_URL=postgresql://postgres:TU_PASSWORD@postgres:5432/todowp?schema=public
SHADOW_DATABASE_URL=postgresql://postgres:TU_PASSWORD@postgres:5432/todowp_shadow?schema=public
AUTH_SECRET=GENERA_CON_OPENSSL_RAND_BASE64_32
AUTH_URL=https://TU-DOMINIO.easypanel.host
AUTH_TRUST_HOST=true
```

### Cómo generar AUTH_SECRET

En tu terminal local ejecuta:
```bash
openssl rand -base64 32
```

Copia el resultado y pégalo como valor de `AUTH_SECRET`.

## 6. Configurar dominio

Easypanel asigna automáticamente un subdominio `*.easypanel.host` con SSL.

Para ver tu dominio:
1. Entra al servicio `app`
2. En la pestaña **"Domains"** verás tu URL asignada
3. Esa URL es la que debes usar en `NEXT_PUBLIC_APP_URL` y `AUTH_URL`

## 7. Desplegar

1. Click en **"Deploy"**
2. Espera 3-5 minutos mientras se construye la imagen
3. Revisa los logs para confirmar que no hay errores
4. Cuando esté corriendo, abre la URL en tu navegador

## 8. Inicializar la base de datos (primera vez)

La base de datos está vacía. Necesitas correr las migraciones y opcionalmente el seed.

### Opción A: Desde la terminal de Easypanel (recomendado)

1. Ve al servicio `app` -> **"Terminal"** (o usa SSH)
2. Ejecuta:
```bash
npx prisma db push
npx tsx prisma/seed.ts
```

### Opción B: Conectar localmente

Si quieres correr las migraciones desde tu máquina local:
```bash
DATABASE_URL="postgresql://postgres:TU_PASSWORD@postgres:5432/todowp?schema=public" npx prisma db push
DATABASE_URL="postgresql://postgres:TU_PASSWORD@postgres:5432/todowp?schema=public" npx tsx prisma/seed.ts
```

## 9. Credenciales por defecto

Después del seed, puedes entrar con:
- **Admin**: `admin@todowp.dev` / `admin123456`
- **Usuario**: `ana@example.com` / `user123456`

**IMPORTANTE**: cambia estas contraseñas en producción.

## Variables de entorno opcionales

### Email (SMTP)
Configura un proveedor como Resend, Brevo o Mailgun:
```env
SMTP_HOST=smtp.resend.com
SMTP_PORT=587
SMTP_USER=resend
SMTP_PASSWORD=tu_api_key
SMTP_FROM_NAME=TodoWP
SMTP_FROM_EMAIL=no-reply@tudominio.com
```

### Pagos
Para activar pagos, agrega las credenciales del proveedor:
```env
# Stripe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# PayPal
PAYPAL_CLIENT_ID=...
PAYPAL_CLIENT_SECRET=...
PAYPAL_MODE=live

# MercadoPago
MERCADOPAGO_ACCESS_TOKEN=APP_USR-...
```

Después de configurar, activa los métodos en el panel admin:
`/admin/settings` -> Pestaña "Pagos"

### Cloudflare R2 (almacenamiento)
```env
R2_ACCOUNT_ID=tu_account_id
R2_ACCESS_KEY_ID=tu_access_key
R2_SECRET_ACCESS_KEY=tu_secret_key
R2_BUCKET=todowp-files
R2_PUBLIC_URL=https://files.tudominio.com
```

## Troubleshooting

### La app no arranca
- Revisa los logs en Easypanel
- Verifica que `DATABASE_URL` apunta a `postgres:5432` (no `localhost`)
- Confirma que el servicio `postgres` está corriendo y healthy

### Error de conexión a la base de datos
- El host debe ser `postgres` (nombre del servicio interno)
- Verifica que la contraseña en `DATABASE_URL` coincide con la del servicio postgres

### Error 500 en todas las páginas
- Falta `AUTH_SECRET` o `DATABASE_URL`
- Revisa los logs del contenedor

### Cambios no se reflejan
- Easypanel hace redeploy automático al hacer push a `main`
- También puedes forzar un redeploy desde el panel

## Auto-deploy

Easypanel detecta automáticamente nuevos commits en la rama `main` y redespliega. Solo necesitas hacer `git push` desde tu máquina local.

```bash
git add .
git commit -m "tu mensaje"
git push origin main
```

Easypanel reconstruirá la imagen y reiniciará el contenedor automáticamente.
