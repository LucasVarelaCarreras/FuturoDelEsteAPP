import type { ReactNode } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { Icon, type Glyph } from './Icon'
import { Avatar } from './ui'
import { colorForId } from '@/lib/format'
import { useRealtime } from '@/hooks/useRealtime'
import { InstallPrompt } from './InstallPrompt'

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
  useRealtime(Boolean(profile))
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

function WaveMark() {
  return (
    <svg width="34" height="34" viewBox="0 0 100 100" aria-hidden="true">
      <defs>
        <linearGradient id="wm" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#01B8A4" />
          <stop offset="0.5" stopColor="#019AC4" />
          <stop offset="1" stopColor="#01608F" />
        </linearGradient>
      </defs>
      <rect width="100" height="100" rx="24" fill="#E2F3F9" />
      <circle cx="50" cy="50" r="27" fill="url(#wm)" />
      <g fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round">
        <path d="M30 44q5 -5 10 0t10 0t10 0" />
        <path d="M30 52q5 -5 10 0t10 0t10 0" />
        <path d="M30 60q5 -5 10 0t10 0t10 0" />
      </g>
    </svg>
  )
}
