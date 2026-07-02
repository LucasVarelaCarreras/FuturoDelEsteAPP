import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useActivities, useAssignments, useAthletes, useGuides, useNeeds } from '@/hooks/data'
import { Card, EmptyState, FullScreenLoader } from '@/components/ui'
import { Icon } from '@/components/Icon'
import { missingForActivity, uncoveredForActivity } from '@/lib/coverage'
import { formatDateLabel } from '@/lib/format'

export function AdminPanel() {
  const navigate = useNavigate()
  const athletesQ = useAthletes()
  const activitiesQ = useActivities()
  const needsQ = useNeeds()
  const assignmentsQ = useAssignments()
  const guidesQ = useGuides()

  const athletes = athletesQ.data ?? []
  const activities = activitiesQ.data ?? []
  const needs = needsQ.data ?? []
  const assignments = assignmentsQ.data ?? []

  const alerts = useMemo(() => {
    return activities
      .map((a) => ({
        activity: a,
        missing: missingForActivity(needs, assignments, a.id),
        uncovered: uncoveredForActivity(needs, assignments, a.id),
      }))
      .filter((x) => x.missing > 0)
      .sort((a, b) => (a.activity.date ?? '9999').localeCompare(b.activity.date ?? '9999'))
  }, [activities, needs, assignments])

  if (athletesQ.isLoading || activitiesQ.isLoading || needsQ.isLoading || assignmentsQ.isLoading) {
    return <FullScreenLoader />
  }

  const kpis = [
    { label: 'Atletas activos', value: athletes.filter((a) => a.active).length, color: 'var(--fde-emerald)' },
    { label: 'Actividades', value: activities.length, color: 'var(--fde-cyan)' },
    { label: 'Guías registrados', value: guidesQ.data?.length ?? 0, color: 'var(--fde-ocean)' },
    {
      label: 'Cupos por cubrir',
      value: activities.reduce((s, a) => s + missingForActivity(needs, assignments, a.id), 0),
      color: 'var(--fde-warning)',
    },
  ]

  return (
    <div style={{ padding: '18px 16px 8px' }}>
      <h1 style={{ fontSize: 23, marginBottom: 4 }}>Panel</h1>
      <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 18 }}>Resumen general de la fundación</p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 24 }}>
        {kpis.map((k) => (
          <Card key={k.label} style={{ padding: 15 }}>
            <div style={{ fontSize: 28, fontWeight: 900, color: k.color, lineHeight: 1 }}>{k.value}</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 700, marginTop: 6 }}>{k.label}</div>
          </Card>
        ))}
      </div>

      <h2 style={{ fontSize: 16, marginBottom: 12 }}>Alertas de cobertura</h2>
      {alerts.length === 0 ? (
        <EmptyState icon={<Icon glyph="checkcircle" size={28} color="var(--fde-success)" />} title="Todo cubierto" body="No hay cupos pendientes de acompañante." />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {alerts.map(({ activity, missing, uncovered }) => (
            <button
              key={activity.id}
              onClick={() => navigate(`/actividad/${activity.id}`)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                textAlign: 'left',
                width: '100%',
                background: 'var(--surface-card)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: 14,
                boxShadow: 'var(--shadow-xs)',
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  background: uncovered > 0 ? '#fdecea' : '#fbf0d8',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flex: '0 0 40px',
                }}
              >
                <Icon glyph={uncovered > 0 ? 'alert' : 'clock'} size={20} color={uncovered > 0 ? '#c0392b' : '#8a5d0c'} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 800, fontSize: 14.5, color: 'var(--text-heading)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {activity.name}
                </div>
                <div style={{ fontSize: 12.5, color: 'var(--text-muted)', fontWeight: 600 }}>
                  {formatDateLabel(activity.date)} · faltan {missing} acompañante{missing > 1 ? 's' : ''}
                </div>
              </div>
              <Icon glyph="chevron" size={18} color="var(--text-muted)" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
