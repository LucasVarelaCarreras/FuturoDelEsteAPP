# Futuro del Este

Aplicación web **mobile-first / PWA** de la Fundación Futuro del Este que conecta
**atletas líder** con **atletas guía** (acompañantes) para actividades, entrenamientos
y eventos deportivos inclusivos.

Ya no es una demo: es una aplicación funcional, con base de datos real, autenticación,
persistencia y reglas de seguridad, lista para producción.

---

## ✨ Características

- **Dos roles reales** con experiencias distintas:
  - **Atleta Guía** — descubre cupos abiertos, se anota para acompañar y gestiona sus acompañamientos.
  - **Administrador** — gestiona atletas, actividades, cobertura de acompañantes y ve el panel general.
- **Autenticación** por email/contraseña y Google (Supabase Auth).
- **Base de datos PostgreSQL** con **Row Level Security** (reglas de acceso por rol).
- **Términos y Condiciones** con registro de auditoría (fecha, versión, IP, dispositivo, hash del documento).
- **PWA completa**: instalable en iOS y Android, modo standalone, service worker, íconos y splash.
- **Sin datos ficticios ni mocks**: todo persiste en la base.

## 🧱 Stack

| Capa            | Tecnología                                  |
| --------------- | ------------------------------------------- |
| Frontend        | React 18 + TypeScript + Vite                |
| Enrutado        | React Router                                |
| Estado servidor | TanStack Query                              |
| Backend / DB    | Supabase (PostgreSQL, Auth, RLS)            |
| Validación      | Zod                                         |
| PWA             | vite-plugin-pwa (Workbox)                   |

## 🚀 Puesta en marcha

### 1. Crear el proyecto de Supabase

1. Entrá a [app.supabase.com](https://app.supabase.com) y creá un proyecto (plan gratuito).
2. En **SQL Editor**, pegá y ejecutá el contenido de
   [`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql).
   Esto crea todas las tablas, funciones, triggers y políticas RLS.
3. En **Authentication → Providers**, habilitá **Email** (y opcionalmente **Google**).
   - Para Google, configurá el OAuth y agregá tu dominio a las *Redirect URLs*.
   - Si querés evitar la confirmación por email en desarrollo, desactivá
     "Confirm email" en **Authentication → Providers → Email**.

### 2. Configurar variables de entorno

```bash
cp .env.example .env
```

Completá en `.env`:

```
VITE_SUPABASE_URL=https://TU-PROYECTO.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key
VITE_ADMIN_TEAM_CODE=UN-CODIGO-SECRETO   # requerido para registrar administradores
```

(Los valores están en Supabase → **Project Settings → API**.)

### 3. Instalar y correr

```bash
npm install
npm run dev
```

La app queda en `http://localhost:5173`.

### 4. Crear el primer administrador

En la pantalla de inicio → **"Soy del equipo de la fundación"** → **Registrarme**,
usando el `VITE_ADMIN_TEAM_CODE` que configuraste. El resto de las cuentas se crean
como **atleta guía** por defecto.

## 📦 Build y despliegue

```bash
npm run build      # genera dist/ (incluye service worker y manifest)
npm run preview    # sirve el build localmente
```

Desplegá `dist/` en cualquier hosting estático. Incluye configuración lista para:

- **Vercel** (`vercel.json`)
- **Netlify** (`netlify.toml`)

Ambos configuran el *fallback* de SPA. Recordá cargar las variables `VITE_*`
en el panel del hosting.

## 📱 Instalación como app (PWA)

- **iOS (Safari):** Compartir → *Añadir a pantalla de inicio*.
- **Android (Chrome):** menú → *Instalar aplicación*.

Se abre en modo standalone (sin barras del navegador), con ícono y splash propios.

## 🔐 Seguridad

- Todas las tablas tienen **RLS activado**; el cliente sólo usa la `anon key` pública.
- Las guías sólo pueden crear/cancelar **sus propios** acompañamientos.
- Sólo administradores pueden crear/editar atletas, actividades y cobertura.
- La verificación de rol se hace con la función `is_admin()` (SECURITY DEFINER, sin recursión).

## 🗂️ Estructura

```
src/
  components/     UI reutilizable (Icon, Sheet, NeedCard, AppShell, ui, fields…)
  context/        AuthContext, ToastContext
  hooks/          data.ts (queries y mutations con TanStack Query)
  lib/            supabase, queryClient, format, coverage, terms
  screens/        auth/ · guia/ · admin/
  types/          database.ts (tipos de la DB)
supabase/
  migrations/     0001_init.sql (esquema + RLS)
scripts/
  gen-icons.mjs   genera los íconos PWA desde el logo de marca
legacy/           material y prototipos originales (referencia, no se usa en runtime)
```

## 🧭 Regenerar íconos

```bash
npm run gen:icons
```

---

Fundación Futuro del Este · MVP funcional v1.0.0
