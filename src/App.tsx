import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { isSupabaseConfigured } from '@/lib/supabase'
import { FullScreenLoader } from '@/components/ui'
import { ConfigNeeded } from '@/screens/ConfigNeeded'
import { AuthScreen } from '@/screens/auth/AuthScreen'
import { AppShell } from '@/components/AppShell'
import { TermsGate } from '@/screens/TermsGate'

const GuiaInicio = lazy(() => import('@/screens/guia/GuiaInicio').then((m) => ({ default: m.GuiaInicio })))
const GuiaActividades = lazy(() => import('@/screens/guia/GuiaActividades').then((m) => ({ default: m.GuiaActividades })))
const GuiaPerfil = lazy(() => import('@/screens/guia/GuiaPerfil').then((m) => ({ default: m.GuiaPerfil })))
const AdminPanel = lazy(() => import('@/screens/admin/AdminPanel').then((m) => ({ default: m.AdminPanel })))
const AdminAtletas = lazy(() => import('@/screens/admin/AdminAtletas').then((m) => ({ default: m.AdminAtletas })))
const AdminActividades = lazy(() => import('@/screens/admin/AdminActividades').then((m) => ({ default: m.AdminActividades })))
const AdminActividadDetalle = lazy(() =>
  import('@/screens/admin/AdminActividadDetalle').then((m) => ({ default: m.AdminActividadDetalle })),
)
const AdminConfig = lazy(() => import('@/screens/admin/AdminConfig').then((m) => ({ default: m.AdminConfig })))

export function App() {
  const { session, profile, role, loading } = useAuth()

  if (!isSupabaseConfigured) return <ConfigNeeded />
  if (loading) return <FullScreenLoader label="Iniciando…" />
  if (!session) return <AuthScreen />
  if (!profile) return <FullScreenLoader label="Preparando tu cuenta…" />

  if (role === 'admin') {
    return (
      <AppShell>
        <Suspense fallback={<FullScreenLoader />}>
          <Routes>
            <Route path="/panel" element={<AdminPanel />} />
            <Route path="/atletas" element={<AdminAtletas />} />
            <Route path="/actividades" element={<AdminActividades />} />
            <Route path="/actividad/:id" element={<AdminActividadDetalle />} />
            <Route path="/config" element={<AdminConfig />} />
            <Route path="*" element={<Navigate to="/panel" replace />} />
          </Routes>
        </Suspense>
      </AppShell>
    )
  }

  return (
    <TermsGate>
      <AppShell>
        <Suspense fallback={<FullScreenLoader />}>
          <Routes>
            <Route path="/inicio" element={<GuiaInicio />} />
            <Route path="/actividades" element={<GuiaActividades />} />
            <Route path="/perfil" element={<GuiaPerfil />} />
            <Route path="*" element={<Navigate to="/inicio" replace />} />
          </Routes>
        </Suspense>
      </AppShell>
    </TermsGate>
  )
}
