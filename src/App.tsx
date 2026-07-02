import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { isSupabaseConfigured } from '@/lib/supabase'
import { FullScreenLoader } from '@/components/ui'
import { ConfigNeeded } from '@/screens/ConfigNeeded'
import { AuthScreen } from '@/screens/auth/AuthScreen'
import { AppShell } from '@/components/AppShell'
import { TermsGate } from '@/screens/TermsGate'
import { GuiaInicio } from '@/screens/guia/GuiaInicio'
import { GuiaActividades } from '@/screens/guia/GuiaActividades'
import { GuiaPerfil } from '@/screens/guia/GuiaPerfil'
import { AdminPanel } from '@/screens/admin/AdminPanel'
import { AdminAtletas } from '@/screens/admin/AdminAtletas'
import { AdminActividades } from '@/screens/admin/AdminActividades'
import { AdminActividadDetalle } from '@/screens/admin/AdminActividadDetalle'
import { AdminConfig } from '@/screens/admin/AdminConfig'

export function App() {
  const { session, profile, role, loading } = useAuth()

  if (!isSupabaseConfigured) return <ConfigNeeded />
  if (loading) return <FullScreenLoader label="Iniciando…" />
  if (!session) return <AuthScreen />
  // Sesión iniciada pero el perfil aún no está disponible.
  if (!profile) return <FullScreenLoader label="Preparando tu cuenta…" />

  if (role === 'admin') {
    return (
      <AppShell>
        <Routes>
          <Route path="/panel" element={<AdminPanel />} />
          <Route path="/atletas" element={<AdminAtletas />} />
          <Route path="/actividades" element={<AdminActividades />} />
          <Route path="/actividad/:id" element={<AdminActividadDetalle />} />
          <Route path="/config" element={<AdminConfig />} />
          <Route path="*" element={<Navigate to="/panel" replace />} />
        </Routes>
      </AppShell>
    )
  }

  // Rol guía: exige aceptar los T&C vigentes antes de continuar.
  return (
    <TermsGate>
      <AppShell>
        <Routes>
          <Route path="/inicio" element={<GuiaInicio />} />
          <Route path="/actividades" element={<GuiaActividades />} />
          <Route path="/perfil" element={<GuiaPerfil />} />
          <Route path="*" element={<Navigate to="/inicio" replace />} />
        </Routes>
      </AppShell>
    </TermsGate>
  )
}
