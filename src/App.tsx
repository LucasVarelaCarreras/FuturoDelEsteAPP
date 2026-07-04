import { lazy, Suspense, useState } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { isSupabaseConfigured } from '@/lib/supabase'
import { Button, FullScreenLoader } from '@/components/ui'
import { Icon } from '@/components/Icon'
import { ConfigNeeded } from '@/screens/ConfigNeeded'
import { AuthScreen } from '@/screens/auth/AuthScreen'
import { UpdatePassword } from '@/screens/auth/UpdatePassword'
import { AppShell } from '@/components/AppShell'
import { TermsGate } from '@/screens/TermsGate'
import { CuentaDesactivada } from '@/screens/CuentaDesactivada'

const GuiaInicio = lazy(() => import('@/screens/guia/GuiaInicio').then((m) => ({ default: m.GuiaInicio })))
const GuiaActividades = lazy(() => import('@/screens/guia/GuiaActividades').then((m) => ({ default: m.GuiaActividades })))
const GuiaActividadDetalle = lazy(() =>
  import('@/screens/guia/GuiaActividadDetalle').then((m) => ({ default: m.GuiaActividadDetalle })),
)
const GuiaPerfil = lazy(() => import('@/screens/guia/GuiaPerfil').then((m) => ({ default: m.GuiaPerfil })))
const AdminPanel = lazy(() => import('@/screens/admin/AdminPanel').then((m) => ({ default: m.AdminPanel })))
const AdminAtletas = lazy(() => import('@/screens/admin/AdminAtletas').then((m) => ({ default: m.AdminAtletas })))
const AdminActividades = lazy(() => import('@/screens/admin/AdminActividades').then((m) => ({ default: m.AdminActividades })))
const AdminActividadDetalle = lazy(() =>
  import('@/screens/admin/AdminActividadDetalle').then((m) => ({ default: m.AdminActividadDetalle })),
)
const AdminGuiaDetalle = lazy(() =>
  import('@/screens/admin/AdminGuiaDetalle').then((m) => ({ default: m.AdminGuiaDetalle })),
)
const AdminConfig = lazy(() => import('@/screens/admin/AdminConfig').then((m) => ({ default: m.AdminConfig })))

export function App() {
  const { session, profile, role, loading, profileError, passwordRecovery } = useAuth()

  if (!isSupabaseConfigured) return <ConfigNeeded />
  if (loading) return <FullScreenLoader label="Iniciando…" />
  // Enlace de recuperación de contraseña: prioridad sobre todo lo demás.
  if (passwordRecovery) return <UpdatePassword />
  if (!session) return <AuthScreen />
  // Hay sesión pero el perfil no cargó (p. ej. sin conexión): ofrecemos
  // reintentar o cerrar sesión en vez de dejar un cargador infinito.
  if (!profile) return profileError ? <ProfileErrorScreen /> : <FullScreenLoader label="Preparando tu cuenta…" />

  if (role === 'admin') {
    return (
      <AppShell>
        <Suspense fallback={<FullScreenLoader />}>
          <Routes>
            <Route path="/panel" element={<AdminPanel />} />
            <Route path="/atletas" element={<AdminAtletas />} />
            <Route path="/actividades" element={<AdminActividades />} />
            <Route path="/actividad/:id" element={<AdminActividadDetalle />} />
            <Route path="/atleta-guia/:id" element={<AdminGuiaDetalle />} />
            <Route path="/config" element={<AdminConfig />} />
            <Route path="*" element={<Navigate to="/panel" replace />} />
          </Routes>
        </Suspense>
      </AppShell>
    )
  }

  // Cuenta desactivada por la coordinación: pantalla de bloqueo en lugar
  // de la app (el servidor además rechaza inscripciones, migración 0005).
  if (profile.active === false) return <CuentaDesactivada />

  return (
    <TermsGate>
      <AppShell>
        <Suspense fallback={<FullScreenLoader />}>
          <Routes>
            <Route path="/inicio" element={<GuiaInicio />} />
            <Route path="/actividades" element={<GuiaActividades />} />
            <Route path="/actividad/:id" element={<GuiaActividadDetalle />} />
            <Route path="/perfil" element={<GuiaPerfil />} />
            <Route path="*" element={<Navigate to="/inicio" replace />} />
          </Routes>
        </Suspense>
      </AppShell>
    </TermsGate>
  )
}

/** Sesión válida pero el perfil no se pudo cargar: reintentar o salir. */
function ProfileErrorScreen() {
  const { refreshProfile, signOut } = useAuth()
  const [retrying, setRetrying] = useState(false)

  const retry = async () => {
    setRetrying(true)
    try {
      await refreshProfile()
    } finally {
      setRetrying(false)
    }
  }

  return (
    <div
      style={{
        minHeight: '100dvh',
        maxWidth: 'var(--app-max)',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        padding: '24px 28px',
        textAlign: 'center',
        background: 'var(--surface-page)',
      }}
    >
      <Icon glyph="alert" size={34} color="var(--fde-danger)" />
      <h1 style={{ fontSize: 19 }}>No pudimos cargar tu cuenta</h1>
      <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 10, lineHeight: 1.5 }}>
        Revisá tu conexión a internet e intentá de nuevo.
      </p>
      <Button full loading={retrying} onClick={retry}>
        Reintentar
      </Button>
      <button
        onClick={() => signOut()}
        style={{
          background: 'none',
          border: 'none',
          color: 'var(--text-muted)',
          fontWeight: 700,
          fontSize: 13.5,
          padding: 8,
        }}
      >
        Cerrar sesión
      </button>
    </div>
  )
}
