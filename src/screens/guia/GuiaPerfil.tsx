import { useMemo, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import {
  useActivities,
  useAssignments,
  useAthletes,
  useCancelAssignment,
  useLatestTermsAcceptance,
} from '@/hooks/data'
import { useToast } from '@/context/ToastContext'
import { Avatar, Button, Card, EmptyState, ErrorState, FullScreenLoader } from '@/components/ui'
import { Sheet } from '@/components/Sheet'
import { Icon } from '@/components/Icon'
import { colorForId, formatDateLabel } from '@/lib/format'
import type { AssignmentRow } from '@/types/database'

export function GuiaPerfil() {
  const { profile, signOut } = useAuth()
  const { notify } = useToast()
  const activitiesQ = useActivities()
  const athletesQ = useAthletes()
  const assignmentsQ = useAssignments()
  const tcQ = useLatestTermsAcceptance(profile?.id)
  const cancel = useCancelAssignment()

  const [cancelAssignment, setCancelAssignment] = useState<AssignmentRow | null>(null)

  const doCancel = async () => {
    if (!cancelAssignment) return
    try {
      await cancel.mutateAsync(cancelAssignment.id)
      notify('Acompañamiento cancelado')
    } catch {
      notify('No se pudo cancelar. Intentá de nuevo.')
    } finally {
      setCancelAssignment(null)
    }
  }

  const athMap = useMemo(() => new Map((athletesQ.data ?? []).map((a) => [a.id, a])), [athletesQ.data])
  const actMap = useMemo(() => new Map((activitiesQ.data ?? []).map((a) => [a.id, a])), [activitiesQ.data])

  const mine = useMemo(
    () =>
      (assignmentsQ.data ?? [])
        .filter((a) => a.guide_id === profile?.id)
        .map((a) => ({ assignment: a, act: actMap.get(a.activity_id), ath: athMap.get(a.athlete_id) }))
        .filter((r) => r.act && r.ath)
        .sort((a, b) => (a.act!.date ?? '9999').localeCompare(b.act!.date ?? '9999')),
    [assignmentsQ.data, profile, actMap, athMap],
  )

  if (activitiesQ.isLoading || athletesQ.isLoading || assignmentsQ.isLoading) return <FullScreenLoader />
  if (activitiesQ.isError || athletesQ.isError || assignmentsQ.isError) {
    return (
      <ErrorState
        onRetry={() => {
          activitiesQ.refetch()
          athletesQ.refetch()
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

      <h2 style={{ fontSize: 16, marginBottom: 12 }}>Mis acompañamientos</h2>
      {mine.length === 0 ? (
        <EmptyState icon={<Icon glyph="calendar" size={28} color="var(--fde-cyan)" />} title="Sin acompañamientos" body="Cuando te anotes para acompañar a un Atleta Líder, aparecerá acá." />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {mine.map((r) => (
            <Card key={r.assignment.id} style={{ padding: 14, display: 'flex', alignItems: 'center', gap: 12 }}>
              <Avatar initials={r.ath!.initials} color={r.ath!.color} size={42} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 800, fontSize: 14.5, color: 'var(--text-heading)' }}>{r.ath!.name}</div>
                <div style={{ fontSize: 12.5, color: 'var(--text-muted)', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {r.act!.name} · {formatDateLabel(r.act!.date)}
                </div>
              </div>
              <button
                onClick={() => setCancelAssignment(r.assignment)}
                aria-label={`Cancelar acompañamiento a ${r.ath!.name}`}
                style={{
                  flexShrink: 0,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-pill)',
                  border: '1.5px solid var(--border-subtle)',
                  background: 'var(--surface-card)',
                  color: 'var(--fde-danger)',
                  fontWeight: 800,
                  fontSize: 12.5,
                  cursor: 'pointer',
                }}
              >
                <Icon glyph="x" size={14} color="var(--fde-danger)" /> Cancelar
              </button>
            </Card>
          ))}
        </div>
      )}

      <h2 style={{ fontSize: 16, margin: '24px 0 12px' }}>Términos y Condiciones</h2>
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

      {/* Confirmar cancelación (mismo patrón que Inicio/Actividades) */}
      <Sheet open={!!cancelAssignment} onClose={() => setCancelAssignment(null)} title="Cancelar acompañamiento">
        <div style={{ paddingBottom: 8 }}>
          <p style={{ fontSize: 14.5, color: 'var(--text-body)', lineHeight: 1.6, marginBottom: 16 }}>
            ¿Seguro que querés cancelar tu acompañamiento? El cupo quedará disponible para otra persona.
          </p>
          <Button full variant="danger" loading={cancel.isPending} onClick={doCancel}>
            Sí, cancelar
          </Button>
        </div>
      </Sheet>
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
