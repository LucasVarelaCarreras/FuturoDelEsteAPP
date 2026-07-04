import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useActivities, useAssignments, useAthletes, useGuides, useNeeds } from '@/hooks/data'
import { Card, EmptyState, ErrorState, FullScreenLoader } from '@/components/ui'
import { Icon } from '@/components/Icon'
import { missingForActivity, uncoveredForActivity } from '@/lib/coverage'
import { formatDateLabel, todayIso } from '@/lib/format'

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

  // Sólo cuentan los cupos que todavía se pueden cubrir: actividades de hoy
  // en adelante y atletas activos. Las actividades pasadas ya no admiten
  // anotarse (los guías ni las ven) y los atletas inactivos están ocultos
  // para los guías, así que alertar por ellos sería ruido imposible de resolver.
  const openNeeds = useMemo(() => {
    const activeIds = new Set(athletes.filter((a) => a.active).map((a) => a.id))
    return needs.filter((n) => activeIds.has(n.athlete_id))
  }, [needs, athletes])

  const upcoming = useMemo(() => {
    const today = todayIso()
    return activities.filter((a) => !a.date || a.date >= today)
  }, [activities])

  const alerts = useMemo(() => {
    return upcoming
      .map((a) => ({
        activity: a,
        missing: missingForActivity(openNeeds, assignments, a.id),
        uncovered: uncoveredForActivity(openNeeds, assignments, a.id),
      }))
      .filter((x) => x.missing > 0)
      .sort((a, b) => (a.activity.date ?? '9999').localeCompare(b.activity.date ?? '9999'))
  }, [upcoming, openNeeds, assignments])

  if (
    athletesQ.isLoading ||
    activitiesQ.isLoading ||
    needsQ.isLoading ||
    assignmentsQ.isLoading ||
    guidesQ.isLoading
  ) {
    return <FullScreenLoader />
  }
  if (athletesQ.isError || activitiesQ.isError || needsQ.isError || assignmentsQ.isError || guidesQ.isError) {
    return (
      <ErrorState
        onRetry={() => {
          athletesQ.refetch()
          activitiesQ.refetch()
          needsQ.refetch()
          assignmentsQ.refetch()
          guidesQ.refetch()
        }}
      />
    )
  }

  const kpis = [
    { label: 'Atletas Líder activos', value: athletes.filter((a) => a.active).length, color: 'var(--fde-emerald)' },
    { label: 'Actividades', value: activities.length, color: 'var(--fde-cyan)' },
    { label: 'Atletas Guía registrados', value: guidesQ.data?.length ?? 0, color: 'var(--fde-ocean)' },
    {
      label: 'Cupos por cubrir',
      value: upcoming.reduce((s, a) => s + missingForActivity(openNeeds, assignments, a.id), 0),
      color: 'var(--fde-warning)',
    },
  ]

  return (
    <div>
      {/* Header decorativo con el degradé de marca (mismo patrón que los
          detalles), como separador visual antes de los paneles. */}
      <div data-deco-header="1" style={decoHeader}>
        <h1 style={{ fontSize: 23, margin: 0, color: '#fff' }}>Panel</h1>
        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.85)', margin: '6px 0 0' }}>Resumen general de la fundación</p>
      </div>

      <div style={{ padding: '18px 16px 8px' }}>
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
    </div>
  )
}

/** Header decorativo con el degradé oscuro de marca (copiado de los detalles). */
const decoHeader = {
  background: 'var(--gradient-deep)',
  padding: 'calc(var(--safe-top) + 16px) 20px 26px',
  borderBottomLeftRadius: 28,
  borderBottomRightRadius: 28,
  color: '#fff',
} as const
