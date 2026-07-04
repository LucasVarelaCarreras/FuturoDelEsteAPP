import { useEffect, type ReactNode } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { Icon, type Glyph } from './Icon'
import { Avatar } from './ui'
import { colorForId } from '@/lib/format'
import { useRealtime } from '@/hooks/useRealtime'
import { InstallPrompt } from './InstallPrompt'
import { useToast } from '@/context/ToastContext'
import { ADMIN_CODE_CHECK_KEY } from '@/screens/auth/AuthScreen'
import logoUrl from '@/assets/logo.png'

interface NavItem {
  to: string
  label: string
  glyph: Glyph
}

const GUIA_NAV: NavItem[] = [
  { to: '/inicio', label: 'Inicio', glyph: 'home' },
  { to: '/actividades', label: 'Actividades', glyph: 'calendar' },
  { to: '/perfil', label: 'Perfil', glyph: 'user' },
]

const ADMIN_NAV: NavItem[] = [
  { to: '/panel', label: 'Panel', glyph: 'grid' },
  { to: '/atletas', label: 'Atletas', glyph: 'users' },
  { to: '/actividades', label: 'Actividades', glyph: 'calendar' },
  { to: '/config', label: 'Ajustes', glyph: 'settings' },
]

export function AppShell({ children }: { children: ReactNode }) {
  const { profile, role } = useAuth()
  const location = useLocation()
  const { notify } = useToast()
  useRealtime(Boolean(profile))

  // Si el usuario intentó registrarse como admin con un código de equipo
  // incorrecto, el servidor lo creó como 'guia' en silencio (por seguridad).
  // Se lo avisamos una sola vez, en vez de dejarlo sin ninguna explicación.
  useEffect(() => {
    if (!profile) return
    if (!sessionStorage.getItem(ADMIN_CODE_CHECK_KEY)) return
    sessionStorage.removeItem(ADMIN_CODE_CHECK_KEY)
    if (profile.role !== 'admin') {
      notify('El código de equipo no era válido: tu cuenta se creó como Atleta Guía.')
    }
  }, [profile, notify])

  const nav = role === 'admin' ? ADMIN_NAV : GUIA_NAV
  const showNav = !location.pathname.startsWith('/actividad/')

  return (
    <div
      style={{
        maxWidth: 'var(--app-max)',
        margin: '0 auto',
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--surface-page)',
        position: 'relative',
      }}
    >
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          background: 'rgba(244,248,250,0.9)',
          backdropFilter: 'saturate(1.2) blur(10px)',
          borderBottom: '1px solid var(--border-subtle)',
          paddingTop: 'var(--safe-top)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 18px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <WaveMark />
            <div>
              <div
                style={{
                  fontFamily: 'var(--font-display)',
                  fontWeight: 700,
                  fontSize: 17,
                  color: 'var(--text-heading)',
                  letterSpacing: '0.01em',
                  lineHeight: 1,
                }}
              >
                FUTURO DEL ESTE
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 700, marginTop: 2 }}>
                {role === 'admin' ? 'Panel de gestión' : 'Atleta Guía'}
              </div>
            </div>
          </div>
          {profile && (
            <Avatar
              initials={profile.initials || 'U'}
              color={colorForId(profile.id)}
              size={38}
            />
          )}
        </div>
      </header>

      <main
        style={{
          flex: 1,
          paddingBottom: showNav ? 'calc(var(--nav-height) + var(--safe-bottom) + 12px)' : 0,
        }}
      >
        {children}
      </main>

      {showNav && (
        <nav
          aria-label="Navegación principal"
          style={{
            position: 'fixed',
            bottom: 0,
            left: '50%',
            transform: 'translateX(-50%)',
            width: '100%',
            maxWidth: 'var(--app-max)',
            background: 'var(--surface-card)',
            borderTop: '1px solid var(--border-subtle)',
            display: 'flex',
            paddingBottom: 'var(--safe-bottom)',
            zIndex: 100,
            boxShadow: '0 -2px 12px rgba(19,59,92,0.05)',
          }}
        >
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              style={({ isActive }) => ({
                flex: 1,
                height: 'var(--nav-height)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 4,
                color: isActive ? 'var(--color-primary)' : 'var(--text-muted)',
                fontWeight: 800,
                fontSize: 11,
              })}
            >
              {({ isActive }) => (
                <>
                  <Icon glyph={item.glyph} size={23} color={isActive ? 'var(--color-primary)' : 'var(--text-muted)'} />
                  {item.label}
                </>
              )}
            </NavLink>
          ))}
        </nav>
      )}

      <InstallPrompt />
    </div>
  )
}

/** Logo oficial de la fundación (generado desde logo.png por gen-icons). */
function WaveMark() {
  return (
    <img
      src={logoUrl}
      width={34}
      height={34}
      alt=""
      aria-hidden="true"
      style={{ display: 'block' }}
    />
  )
}
