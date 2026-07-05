import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { useActivities, useAssignments, useLatestTermsAcceptance } from '@/hooks/data'
import { Avatar, Card, ErrorState, FullScreenLoader } from '@/components/ui'
import { Icon } from '@/components/Icon'
import { colorForId, isActivityPast } from '@/lib/format'

export function GuiaPerfil() {
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()
  const activitiesQ = useActivities()
  const assignmentsQ = useAssignments()
  const tcQ = useLatestTermsAcceptance(profile?.id)

  const actMap = useMemo(() => new Map((activitiesQ.data ?? []).map((a) => [a.id, a])), [activitiesQ.data])

  // Sólo se necesita el conteo de "próximos" para el badge del botón; el
  // detalle completo (Próximos + Historial) vive en /mis-acompanamientos.
  const upcomingCount = useMemo(() => {
    return (assignmentsQ.data ?? [])
      .filter((a) => a.guide_id === profile?.id)
      .map((a) => actMap.get(a.activity_id))
      .filter((act): act is NonNullable<typeof act> => !!act)
      .filter((act) => !isActivityPast(act.date, act.time)).length
  }, [assignmentsQ.data, profile, actMap])

  if (activitiesQ.isLoading || assignmentsQ.isLoading) return <FullScreenLoader />
  if (activitiesQ.isError || assignmentsQ.isError) {
    return (
      <ErrorState
        onRetry={() => {
          activitiesQ.refetch()
          assignmentsQ.refetch()
        }}
      />
    )
  }
  if (!profile) return null

  return (
    <div style={{ padding: '18px 16px 8px' }}>
      <Card style={{ padding: 18, display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
        <Avatar initials={profile.initials || 'U'} color={colorForId(profile.id)} size={56} />
        <div style={{ minWidth: 0 }}>
          <div style={{ fontWeight: 800, fontSize: 18, color: 'var(--text-heading)' }}>{profile.full_name}</div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis' }}>{profile.email}</div>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, marginTop: 6, background: 'var(--fde-cyan-50)', color: 'var(--fde-cyan-700)', fontWeight: 800, fontSize: 11.5, padding: '4px 10px', borderRadius: 'var(--radius-pill)' }}>
            <Icon glyph="heart" size={12} color="var(--fde-cyan-700)" /> Atleta Guía
          </span>
        </div>
      </Card>

      <button
        onClick={() => navigate('/mis-acompanamientos')}
        aria-label="Ver mis acompañamientos"
        style={{
          width: '100%',
          marginBottom: 20,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: 16,
          background: 'var(--surface-card)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          boxShadow: 'var(--shadow-xs)',
          textAlign: 'left',
          cursor: 'pointer',
        }}
      >
        <div
          style={{
            width: 42,
            height: 42,
            flex: '0 0 42px',
            borderRadius: 14,
            background: 'var(--fde-cyan-50)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon glyph="calendar" size={20} color="var(--fde-cyan-700)" />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 800, fontSize: 15, color: 'var(--text-heading)' }}>Mis acompañamientos</div>
          <div style={{ fontSize: 12.5, color: 'var(--text-muted)', fontWeight: 600, marginTop: 2 }}>
            {upcomingCount > 0 ? `${upcomingCount} próximo${upcomingCount === 1 ? '' : 's'}` : 'Ver historial completo'}
          </div>
        </div>
        {upcomingCount > 0 && (
          <span
            style={{
              flexShrink: 0,
              minWidth: 22,
              height: 22,
              padding: '0 6px',
              borderRadius: 'var(--radius-pill)',
              background: 'var(--color-primary)',
              color: '#fff',
              fontWeight: 800,
              fontSize: 12,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {upcomingCount}
          </span>
        )}
        <Icon glyph="chevron" size={18} color="var(--text-muted)" />
      </button>

      <h2 style={{ fontSize: 16, margin: '0 0 12px' }}>Términos y Condiciones</h2>
      <Card style={{ padding: 16 }}>
        {tcQ.data ? (
          <div style={{ fontSize: 13.5, color: 'var(--text-body)', lineHeight: 1.8 }}>
            <Row label="Aceptado el" value={new Date(tcQ.data.accepted_at).toLocaleString('es-UY')} />
            <Row label="Versión" value={tcQ.data.doc_version} />
          </div>
        ) : (
          <p style={{ fontSize: 13.5, color: 'var(--text-muted)' }}>Sin registro de aceptación.</p>
        )}
      </Card>

      <button
        onClick={() => signOut()}
        style={{
          width: '100%',
          marginTop: 22,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          padding: 14,
          borderRadius: 'var(--radius-pill)',
          border: '1.5px solid var(--border-subtle)',
          background: 'var(--surface-card)',
          color: 'var(--fde-danger)',
          fontWeight: 800,
          fontSize: 14.5,
        }}
      >
        <Icon glyph="logout" size={18} color="var(--fde-danger)" /> Cerrar sesión
      </button>

      <p style={{ textAlign: 'center', fontSize: 11.5, color: 'var(--text-muted)', marginTop: 18 }}>
        Fundación Futuro del Este · v1.0.0
      </p>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
      <span style={{ color: 'var(--text-muted)', fontWeight: 700 }}>{label}</span>
      <span style={{ fontWeight: 700, textAlign: 'right' }}>{value}</span>
    </div>
  )
}
