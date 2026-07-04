import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useActivities, useAssignments, useAthletes, useNeeds } from '@/hooks/data'
import { EmptyState, ErrorState, FullScreenLoader } from '@/components/ui'
import { Icon } from '@/components/Icon'
import type { ActivityType } from '@/types/database'
import { formatDateLabel, statusMeta, todayIso, typeMeta } from '@/lib/format'
import { missingForActivity } from '@/lib/coverage'

const FILTERS: { key: ActivityType | 'all'; label: string }[] = [
  { key: 'all', label: 'Todas' },
  { key: 'carrera', label: 'Carreras' },
  { key: 'entrenamiento', label: 'Entrenamientos' },
  { key: 'evento', label: 'Eventos' },
]

/**
 * Lista simple de actividades del guía (como la "Agenda" de la demo
 * original): cada tarjeta muestra tipo, nombre, fecha/hora, lugar y un
 * resumen de cobertura; al tocarla se abre el detalle (GuiaActividadDetalle),
 * donde están los Atletas Líder y la acción de acompañar.
 */
export function GuiaActividades() {
  const navigate = useNavigate()
  const athletesQ = useAthletes()
  const activitiesQ = useActivities()
  const needsQ = useNeeds()
  const assignmentsQ = useAssignments()

  const [filter, setFilter] = useState<ActivityType | 'all'>('all')
  const [dateOpen, setDateOpen] = useState(false)
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  const athletes = athletesQ.data ?? []
  const activities = activitiesQ.data ?? []
  const needs = needsQ.data ?? []
  const assignments = assignmentsQ.data ?? []

  const athMap = useMemo(() => new Map(athletes.map((a) => [a.id, a])), [athletes])

  // Sólo actividades visibles y de hoy en adelante: las pasadas no admiten
  // anotarse y taparían las próximas (el historial propio queda en Perfil).
  const visibleActivities = useMemo(() => {
    const today = todayIso()
    return activities
      .filter((a) => a.visible)
      .filter((a) => !a.date || a.date >= today)
      .filter((a) => filter === 'all' || a.type === filter)
      .filter((a) => !dateFrom || (a.date ?? '') >= dateFrom)
      .filter((a) => !dateTo || (a.date ?? '') <= dateTo)
      .sort((a, b) => (a.date ?? '9999').localeCompare(b.date ?? '9999'))
  }, [activities, filter, dateFrom, dateTo])

  if (athletesQ.isLoading || activitiesQ.isLoading || needsQ.isLoading || assignmentsQ.isLoading) {
    return <FullScreenLoader />
  }
  if (athletesQ.isError || activitiesQ.isError || needsQ.isError || assignmentsQ.isError) {
    return (
      <ErrorState
        onRetry={() => {
          athletesQ.refetch()
          activitiesQ.refetch()
          needsQ.refetch()
          assignmentsQ.refetch()
        }}
      />
    )
  }

  const hasDateFilter = Boolean(dateFrom || dateTo)

  return (
    <div style={{ padding: '18px 16px 8px' }}>
      <h1 style={{ fontSize: 23, marginBottom: 2 }}>Actividades</h1>
      <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 14 }}>
        Carreras, entrenamientos y eventos
      </p>

      {/* Filtro por tipo (pills) + filtro por rango de fecha */}
      <div className="no-scrollbar" style={{ display: 'flex', gap: 8, overflowX: 'auto', marginBottom: 10, paddingBottom: 2 }}>
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            style={{
              flex: '0 0 auto',
              padding: '8px 16px',
              borderRadius: 'var(--radius-pill)',
              border: '1.5px solid ' + (filter === f.key ? 'var(--color-primary)' : 'var(--border-subtle)'),
              background: filter === f.key ? 'var(--color-primary)' : 'var(--surface-card)',
              color: filter === f.key ? '#fff' : 'var(--text-body)',
              fontWeight: 800,
              fontSize: 13,
            }}
          >
            {f.label}
          </button>
        ))}
        <button
          onClick={() => setDateOpen((o) => !o)}
          aria-label="Filtrar por fecha"
          aria-expanded={dateOpen}
          style={{
            flex: '0 0 auto',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '8px 16px',
            borderRadius: 'var(--radius-pill)',
            border: '1.5px solid ' + (hasDateFilter ? 'var(--color-primary)' : 'var(--border-subtle)'),
            background: hasDateFilter ? 'var(--color-primary)' : 'var(--surface-card)',
            color: hasDateFilter ? '#fff' : 'var(--text-body)',
            fontWeight: 800,
            fontSize: 13,
          }}
        >
          <Icon glyph="calendar" size={14} color={hasDateFilter ? '#fff' : 'var(--text-body)'} /> Fechas
          <Icon glyph="chevron" size={14} color={hasDateFilter ? '#fff' : 'var(--text-muted)'} />
        </button>
      </div>

      {dateOpen && (
        <div
          style={{
            background: 'var(--surface-card)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-xs)',
            padding: 14,
            marginBottom: 12,
          }}
        >
          <div style={{ display: 'flex', gap: 10 }}>
            <label style={{ flex: 1, minWidth: 0 }}>
              <span style={{ display: 'block', fontSize: 11.5, fontWeight: 800, color: 'var(--text-muted)', marginBottom: 5 }}>Desde</span>
              <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} style={dateInput} />
            </label>
            <label style={{ flex: 1, minWidth: 0 }}>
              <span style={{ display: 'block', fontSize: 11.5, fontWeight: 800, color: 'var(--text-muted)', marginBottom: 5 }}>Hasta</span>
              <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} style={dateInput} />
            </label>
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <button
              onClick={() => {
                setDateFrom('')
                setDateTo('')
              }}
              style={{ flex: 1, padding: 10, borderRadius: 'var(--radius-pill)', border: '1.5px solid var(--border-strong)', background: 'var(--surface-card)', color: 'var(--text-muted)', fontWeight: 800, fontSize: 13 }}
            >
              Limpiar
            </button>
            <button
              onClick={() => setDateOpen(false)}
              style={{ flex: 1, padding: 10, borderRadius: 'var(--radius-pill)', border: 'none', background: 'var(--color-primary)', color: '#fff', fontWeight: 800, fontSize: 13 }}
            >
              Listo
            </button>
          </div>
        </div>
      )}

      {visibleActivities.length === 0 ? (
        <EmptyState icon={<Icon glyph="calendar" size={30} color="var(--fde-cyan)" />} title="Sin actividades" body="No hay actividades para este filtro." />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {visibleActivities.map((act) => {
            const tm = typeMeta(act.type)
            // Cobertura agregada de la actividad (sólo Atletas Líder activos):
            // "Completo" si no falta nadie, "Faltan N" o "Sin acompañante".
            const actNeeds = needs.filter((n) => n.activity_id === act.id && athMap.get(n.athlete_id)?.active)
            const totalRequired = actNeeds.reduce((sum, n) => sum + n.required, 0)
            const missing = missingForActivity(actNeeds, assignments, act.id)
            const cov =
              totalRequired === 0
                ? { label: 'Sin Atletas Líder', bg: 'var(--surface-sunken)', text: 'var(--text-muted)' }
                : statusMeta(totalRequired - missing, totalRequired)
            return (
              <button
                key={act.id}
                onClick={() => navigate(`/actividad/${act.id}`)}
                style={{
                  textAlign: 'left',
                  border: '1px solid var(--border-subtle)',
                  background: 'var(--surface-card)',
                  borderRadius: 'var(--radius-lg)',
                  padding: 14,
                  display: 'flex',
                  gap: 13,
                  alignItems: 'center',
                  boxShadow: 'var(--shadow-sm)',
                  cursor: 'pointer',
                }}
              >
                <div style={{ width: 52, height: 52, borderRadius: 15, flexShrink: 0, background: tm.tileBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon glyph={tm.glyph as never} size={23} color={tm.tileColor} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 800, fontSize: 15.5, color: 'var(--text-heading)', lineHeight: 1.18 }}>{act.name}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12.5, color: 'var(--text-muted)', fontWeight: 600, marginTop: 5 }}>
                    <Icon glyph="calendar" size={13} color="var(--text-muted)" />
                    {formatDateLabel(act.date)} · {act.time || 'Hora a definir'}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12.5, color: 'var(--text-muted)', fontWeight: 600, marginTop: 3, minWidth: 0 }}>
                    <Icon glyph="mappin" size={13} color="var(--text-muted)" />
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{act.place || 'Lugar a definir'}</span>
                  </div>
                </div>
                <span
                  style={{
                    background: cov.bg,
                    color: cov.text,
                    fontSize: 11.5,
                    fontWeight: 800,
                    padding: '5px 10px',
                    borderRadius: 'var(--radius-pill)',
                    whiteSpace: 'nowrap',
                    flexShrink: 0,
                  }}
                >
                  {cov.label}
                </span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

const dateInput = {
  width: '100%',
  minWidth: 0,
  padding: '10px 12px',
  borderRadius: 'var(--radius-sm)',
  border: '1.5px solid var(--border-strong)',
  fontFamily: 'var(--font-sans)',
  fontSize: 14,
  color: 'var(--text-heading)',
  background: 'var(--surface-card)',
  outline: 'none',
} as const
