import { useAuth } from '@/context/AuthContext'
import { Avatar, Card } from '@/components/ui'
import { Icon } from '@/components/Icon'
import { TERMS_VERSION } from '@/lib/terms'
import { colorForId } from '@/lib/format'

/**
 * Ajustes del administrador: su perfil, la versión vigente de los T&C y
 * el cierre de sesión. La gestión de los Atletas Guía (ficha completa,
 * estado y registro de aceptación de T&C) vive en Atletas → pestaña
 * "Atletas Guía" → detalle del guía.
 */
export function AdminConfig() {
  const { profile, signOut } = useAuth()

  if (!profile) return null

  return (
    <div style={{ padding: '18px 16px 8px' }}>
      <h1 style={{ fontSize: 23, marginBottom: 16 }}>Ajustes</h1>

      <Card style={{ padding: 18, display: 'flex', alignItems: 'center', gap: 14, marginBottom: 22 }}>
        <Avatar initials={profile.initials || 'A'} color={colorForId(profile.id)} size={52} />
        <div style={{ minWidth: 0 }}>
          <div style={{ fontWeight: 800, fontSize: 17, color: 'var(--text-heading)' }}>{profile.full_name}</div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis' }}>{profile.email}</div>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, marginTop: 6, background: '#e7f1fa', color: 'var(--fde-ocean)', fontWeight: 800, fontSize: 11.5, padding: '4px 10px', borderRadius: 'var(--radius-pill)' }}>
            <Icon glyph="shield" size={12} color="var(--fde-ocean)" /> Administrador
          </span>
        </div>
      </Card>

      <h2 style={{ fontSize: 16, marginBottom: 12 }}>Términos y Condiciones</h2>
      <Card style={{ padding: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13.5 }}>
          <span style={{ color: 'var(--text-muted)', fontWeight: 700 }}>Versión vigente</span>
          <span style={{ fontWeight: 800, color: 'var(--text-heading)' }}>{TERMS_VERSION}</span>
        </div>
      </Card>

      <button
        onClick={() => signOut()}
        style={{ width: '100%', marginTop: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 14, borderRadius: 'var(--radius-pill)', border: '1.5px solid var(--border-subtle)', background: 'var(--surface-card)', color: 'var(--fde-danger)', fontWeight: 800, fontSize: 14.5 }}
      >
        <Icon glyph="logout" size={18} color="var(--fde-danger)" /> Cerrar sesión
      </button>

      <p style={{ textAlign: 'center', fontSize: 11.5, color: 'var(--text-muted)', marginTop: 18 }}>Fundación Futuro del Este · v1.0.0</p>
    </div>
  )
}
