# 🌿 Fit Natural — Plataforma de Catálogo Saludable

Plataforma web empresarial para la tienda de alimentos naturales **Fit Natural**. Catálogo público optimizado para móvil con panel de administración completo.

---

## ✨ Características

- **Catálogo público** con ISR (regeneración automática cada 60s)
- **Filtros en tiempo real** por categoría, precio y búsqueda — sin llamadas API adicionales
- **Botón de WhatsApp** por producto con mensaje prellenado
- **Panel admin protegido** con login (Supabase Auth)
- **CRUD de productos**: crear, editar, eliminar con imagen
- **Subida de imágenes** convertidas a WebP + blur placeholder automático
- **37 productos** precargados desde el catálogo PDF original
- **100% responsive** — optimizado para móvil

---

## 🏗️ Stack Tecnológico

| Capa | Tecnología | Motivo |
|------|-----------|--------|
| Framework | Next.js 14 (App Router) | SSR/ISR, routing, API routes |
| Lenguaje | TypeScript | Tipado estricto |
| Estilos | Tailwind CSS | Utilidades, paleta verde personalizada |
| ORM | Prisma 5 | Tipado fuerte sobre PostgreSQL |
| Base de datos | Supabase PostgreSQL | Free tier, managed |
| Auth | Supabase Auth | Email/password para admin |
| Storage | Supabase Storage | Imágenes públicas de productos |
| Imágenes | Sharp | Conversión WebP + blur placeholder |
| Formularios | React Hook Form + Zod | Validación robusta en admin |
| Notificaciones | Sonner | Toasts elegantes |
| Deploy | Vercel | CI/CD automático desde GitHub |

---

## 📁 Estructura del Proyecto

```
fit-natural/
│
├── app/                          # Next.js App Router
│   ├── page.tsx                  # Catálogo público (ISR 60s)
│   ├── layout.tsx                # Root layout (fuente, toaster)
│   ├── globals.css               # Estilos globales Tailwind
│   │
│   ├── api/
│   │   ├── productos/
│   │   │   ├── route.ts          # GET lista / POST crear
│   │   │   └── [id]/route.ts     # GET / PUT / DELETE por id
│   │   └── upload/route.ts       # POST imagen → Sharp + Supabase Storage
│   │
│   └── admin/
│       ├── layout.tsx            # Shell admin con navegación lateral
│       ├── page.tsx              # Redirige → /admin/productos
│       ├── login/page.tsx        # Login con Supabase Auth
│       └── productos/
│           ├── page.tsx          # Tabla de todos los productos
│           ├── nuevo/page.tsx    # Formulario crear producto
│           └── [id]/page.tsx     # Formulario editar producto
│
├── components/
│   ├── catalog/
│   │   ├── Header.tsx            # Cabecera verde con logo y botón WhatsApp
│   │   ├── Footer.tsx            # Footer con redes sociales
│   │   ├── CatalogClient.tsx     # Lógica de filtros client-side
│   │   ├── Sidebar.tsx           # Panel lateral de filtros
│   │   └── ProductCard.tsx       # Tarjeta de producto con WhatsApp CTA
│   │
│   └── admin/
│       ├── AdminNav.tsx          # Navegación lateral del admin
│       ├── ProductsTable.tsx     # Tabla con acciones editar/eliminar
│       ├── ProductForm.tsx       # Formulario unificado crear/editar
│       └── ImageUpload.tsx       # Drag & drop con preview y subida
│
├── lib/
│   ├── prisma.ts                 # Singleton PrismaClient
│   ├── utils.ts                  # cn() para clases, fmt() para precios COP
│   ├── constants.ts              # Categorías, filtros de precio
│   └── supabase/
│       ├── client.ts             # Cliente browser (componentes client)
│       └── server.ts             # Cliente server (Server Components)
│
├── prisma/
│   ├── schema.prisma             # Modelos Product + Variant
│   ├── seed.ts                   # 37 productos del catálogo PDF
│   └── migrations/               # Historial de migraciones SQL
│
├── types/
│   └── index.ts                  # Interfaces Product, Variant, SerializedProduct
│
├── middleware.ts                 # Protección /admin/* con Supabase SSR
├── next.config.mjs               # Remote patterns para next/image
├── tailwind.config.ts            # Paleta brand (verde) personalizada
└── .env.example                  # Plantilla de variables de entorno
```

---

## 🗄️ Modelo de Datos

```prisma
model Product {
  id          String    @id @default(cuid())
  name        String
  category    String                        # granolas, snacks, lacteos...
  emoji       String    @default("🌿")
  description String
  flavors     String[]                      # Array de sabores disponibles
  imageUrl    String?                       # URL pública en Supabase Storage
  imageBlur   String?                       # Base64 blur placeholder (Sharp 10×10)
  active      Boolean   @default(true)
  sortOrder   Int       @default(0)
  variants    Variant[]
}

model Variant {
  id        String  @id @default(cuid())
  label     String                          # Ej: "300gr", "1 Litro"
  price     Int                             # Pesos colombianos (entero)
  sortOrder Int     @default(0)
  product   Product @relation(...)
}
```

---

## ⚡ Arquitectura de Rendimiento

```
Visita del usuario
      │
      ▼
  Vercel CDN ──► HTML pre-renderizado (ISR)
      │              └─ Revalidación automática cada 60s
      │
      ▼
  CatalogClient (React)
      └─ Todos los productos ya en memoria
      └─ Filtros instantáneos sin llamadas API
      └─ next/image con blur placeholder desde DB
```

**Flujo de subida de imágenes:**
```
Admin sube imagen
      │
      ▼
  /api/upload
      ├─ Sharp: redimensiona a 1200px, convierte a WebP
      ├─ Sharp: genera 10×10px base64 blur placeholder
      └─ Supabase Storage: sube el WebP, retorna URL pública
```

---

## 🚀 Instalación Local

### 1. Clonar e instalar

```bash
git clone https://github.com/tu-usuario/fit-natural.git
cd fit-natural
npm install
```

### 2. Variables de entorno

```bash
cp .env.example .env.local
# Edita .env.local con tus credenciales de Supabase
```

### 3. Crear bucket en Supabase Storage

En **Supabase → Storage → New bucket**:
- Nombre: `product-images`
- Marcar como **Public** ✓

### 4. Migraciones y seed

```bash
npm run db:migrate -- --name init   # Crea las tablas
npm run db:seed                     # Carga los 37 productos
```

### 5. Crear usuario administrador

En **Supabase → Authentication → Users → Add user**

### 6. Correr el servidor

```bash
npm run dev
# http://localhost:3000          → Catálogo
# http://localhost:3000/admin    → Panel admin
```

---

## 🔑 Variables de Entorno

| Variable | Descripción | Dónde obtenerla |
|----------|-------------|-----------------|
| `DATABASE_URL` | Conexión pooler PostgreSQL | Supabase → Settings → Database → **Transaction pooler** (puerto 6543) |
| `DIRECT_URL` | Conexión directa PostgreSQL | Supabase → Settings → Database → **Direct connection** (puerto 5432) |
| `NEXT_PUBLIC_SUPABASE_URL` | URL del proyecto Supabase | Supabase → Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clave pública anon | Supabase → Settings → API → anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Clave privada service role | Supabase → Settings → API → service_role |
| `NEXT_PUBLIC_WA_NUMBER` | Número WhatsApp sin `+` | Ej: `573148375549` |
| `SUPABASE_STORAGE_BUCKET` | Nombre del bucket | El que creaste: `product-images` |

---

## ☁️ Deploy en Vercel

### 1. Subir a GitHub

```bash
git remote add origin https://github.com/tu-usuario/fit-natural.git
git push -u origin master
```

### 2. Importar en Vercel

1. Entra a [vercel.com/new](https://vercel.com/new)
2. Importa el repositorio de GitHub
3. Framework detectado automáticamente: **Next.js**
4. Agrega las variables de entorno (ver sección siguiente)
5. Click **Deploy**

### 3. Configurar variables en Vercel

Ve a tu proyecto → **Settings → Environment Variables** y agrega cada una:

```
DATABASE_URL          → Production + Preview + Development
DIRECT_URL            → Production + Preview + Development
NEXT_PUBLIC_SUPABASE_URL     → Production + Preview + Development
NEXT_PUBLIC_SUPABASE_ANON_KEY → Production + Preview + Development
SUPABASE_SERVICE_ROLE_KEY    → Production + Preview + Development
NEXT_PUBLIC_WA_NUMBER        → Production + Preview + Development
SUPABASE_STORAGE_BUCKET      → Production + Preview + Development
```

> **Nota:** Marca todas para los tres entornos (Production, Preview, Development) para que funcionen también en los deploys de preview de cada PR.

---

## 🛠️ Scripts Disponibles

```bash
npm run dev          # Servidor de desarrollo en localhost:3000
npm run build        # Build de producción
npm run start        # Inicia el servidor de producción
npm run db:migrate   # Crea/aplica migraciones de Prisma
npm run db:seed      # Carga los productos iniciales
npm run db:studio    # Abre Prisma Studio (UI visual de la DB)
npm run db:push      # Sincroniza schema sin migración (solo dev)
npm run db:generate  # Regenera el cliente de Prisma
```

---

## 👤 Autor

**Cristhian Luna**

[![Facebook](https://img.shields.io/badge/Facebook-1877F2?style=flat&logo=facebook&logoColor=white)](https://www.facebook.com/CHRISTHNN)
[![Instagram](https://img.shields.io/badge/Instagram-E4405F?style=flat&logo=instagram&logoColor=white)](https://www.instagram.com/cristhian_lunaa)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-0A66C2?style=flat&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/cristhian-lunaa/)
