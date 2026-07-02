import { useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useGuides, useLatestTermsAcceptance } from '@/hooks/data'
import { Avatar, Card, EmptyState, Spinner } from '@/components/ui'
import { Icon } from '@/components/Icon'
import { Sheet } from '@/components/Sheet'
import { TERMS_VERSION } from '@/lib/terms'
import { colorForId } from '@/lib/format'
import type { ProfileRow } from '@/types/database'

export function AdminConfig() {
  const { profile, signOut } = useAuth()
  const guidesQ = useGuides()
  const [selected, setSelected] = useState<ProfileRow | null>(null)

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

      <h2 style={{ fontSize: 16, marginBottom: 12 }}>Atletas Guía registrados</h2>
      {guidesQ.isLoading ? (
        <div style={{ padding: 30, display: 'flex', justifyContent: 'center' }}>
          <Spinner />
        </div>
      ) : (guidesQ.data ?? []).length === 0 ? (
        <EmptyState icon={<Icon glyph="users" size={26} color="var(--fde-cyan)" />} title="Sin guías" body="Todavía no hay atletas guía registrados." />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {(guidesQ.data ?? []).map((g) => (
            <button
              key={g.id}
              onClick={() => setSelected(g)}
              style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', textAlign: 'left', padding: 13, background: 'var(--surface-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-xs)' }}
            >
              <Avatar initials={g.initials || 'U'} color={colorForId(g.id)} size={40} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 800, fontSize: 14.5, color: 'var(--text-heading)' }}>{g.full_name}</div>
                <div style={{ fontSize: 12.5, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{g.email}</div>
              </div>
              <Icon glyph="shield" size={17} color="var(--text-muted)" />
            </button>
          ))}
        </div>
      )}

      <h2 style={{ fontSize: 16, margin: '24px 0 12px' }}>Términos y Condiciones</h2>
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

      <Sheet open={!!selected} onClose={() => setSelected(null)} title="Aceptación de T&C">
        {selected && <TcDetail guide={selected} />}
      </Sheet>
    </div>
  )
}

/** Muestra la última aceptación de T&C de un guía (auditoría legal). */
function TcDetail({ guide }: { guide: ProfileRow }) {
  const { data, isLoading } = useLatestTermsAcceptance(guide.id)

  if (isLoading) {
    return (
      <div style={{ padding: 24, display: 'flex', justifyContent: 'center' }}>
        <Spinner />
      </div>
    )
  }

  if (!data) {
    return (
      <p style={{ fontSize: 13.5, color: 'var(--text-muted)', padding: '8px 0 20px' }}>
        {guide.full_name} todavía no aceptó los Términos y Condiciones.
      </p>
    )
  }

  const rows: [string, string][] = [
    ['Usuario', guide.full_name],
    ['ID de usuario', data.user_id],
    ['Fecha y hora', new Date(data.accepted_at).toLocaleString('es-UY')],
    ['Versión del documento', data.doc_version || '—'],
    ['Dirección IP', data.ip || '—'],
    ['Dispositivo / navegador', data.user_agent || '—'],
    ['Hash del documento', data.doc_hash || '—'],
  ]

  return (
    <div style={{ paddingBottom: 12 }}>
      {rows.map(([label, value]) => (
        <div key={label} style={{ padding: '10px 0', borderBottom: '1px solid var(--border-subtle)' }}>
          <div style={{ fontSize: 11.5, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.03em', marginBottom: 3 }}>{label}</div>
          <div style={{ fontSize: 13.5, color: 'var(--text-heading)', fontWeight: 600, wordBreak: 'break-all' }}>{value}</div>
        </div>
      ))}
    </div>
  )
}
