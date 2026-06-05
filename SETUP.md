# Fit Natural — Guía de instalación y despliegue

## 1. Requisitos previos

- Node.js 18+ instalado
- Proyecto Supabase creado (free tier)
- Cuenta en GitHub y Vercel

---

## 2. Variables de entorno

Copia `.env.example` a `.env.local` y completa los valores:

```bash
cp .env.example .env.local
```

### Dónde obtener cada valor

| Variable | Dónde encontrarla |
|----------|-------------------|
| `DATABASE_URL` | Supabase → Settings → Database → Connection string → **Pooler** (Transaction mode, port 6543) |
| `DIRECT_URL` | Supabase → Settings → Database → Connection string → **Direct** (port 5432) |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Settings → API → anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Settings → API → service_role key |
| `NEXT_PUBLIC_WA_NUMBER` | Número de WhatsApp sin `+` (ej: `573148375549`) |
| `SUPABASE_STORAGE_BUCKET` | Nombre del bucket que crearás (ej: `product-images`) |

---

## 3. Crear bucket de Storage en Supabase

1. En Supabase → **Storage** → **New bucket**
2. Nombre: `product-images`
3. Marcar como **Public** ✓
4. Crear bucket

---

## 4. Instalar dependencias

```bash
npm install
```

---

## 5. Crear tablas en la base de datos

```bash
npx prisma migrate dev --name init
```

Si hay error de SSL, asegúrate que `DATABASE_URL` tiene `?pgbouncer=true&connect_timeout=15` al final.

---

## 6. Cargar los 37 productos del catálogo

```bash
npm run db:seed
```

---

## 7. Crear usuario administrador

1. En Supabase → **Authentication** → **Users** → **Add user**
2. Ingresa tu email y contraseña
3. Confirma el usuario

---

## 8. Probar localmente

```bash
npm run dev
```

- **Catálogo**: http://localhost:3000
- **Admin login**: http://localhost:3000/admin/login
- **Admin panel**: http://localhost:3000/admin/productos

---

## 9. Subir a GitHub

```bash
git init
git add .
git commit -m "feat: initial Fit Natural enterprise app"
git remote add origin https://github.com/TU_USUARIO/fit-natural.git
git push -u origin main
```

---

## 10. Desplegar en Vercel

1. Entra a [vercel.com](https://vercel.com) → **Add New Project**
2. Importa tu repositorio de GitHub
3. En **Environment Variables**, agrega todas las variables de `.env.local`
4. Click **Deploy**

### Dominio personalizado (opcional)
En Vercel → tu proyecto → **Settings** → **Domains**

---

## Comandos útiles

```bash
npm run dev          # Servidor de desarrollo
npm run build        # Build de producción
npm run db:studio    # Prisma Studio (interfaz visual de la DB)
npm run db:generate  # Regenerar Prisma client
npm run db:push      # Sincronizar schema sin migración (desarrollo)
npm run db:seed      # Recargar productos iniciales
```

---

## Estructura del proyecto

```
app/
  page.tsx              → Catálogo público (ISR 60s)
  admin/
    login/page.tsx      → Login del administrador
    productos/          → CRUD de productos
components/
  catalog/              → Header, Sidebar, ProductCard, CatalogClient
  admin/                → AdminNav, ProductForm, ProductsTable, ImageUpload
lib/
  prisma.ts             → Cliente Prisma singleton
  supabase/             → Clientes Supabase (browser + server)
  utils.ts              → cn(), fmt()
  constants.ts          → Categorías, filtros de precio
prisma/
  schema.prisma         → Modelos Product + Variant
  seed.ts               → 37 productos del catálogo PDF
middleware.ts           → Protección de rutas /admin/*
```
