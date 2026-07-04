import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  useActivities,
  useAssignments,
  useAthletes,
  useFavorites,
  useNeeds,
  useToggleFavorite,
} from '@/hooks/data'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/context/ToastContext'
import { EmptyState, ErrorState, FullScreenLoader } from '@/components/ui'
import { Icon } from '@/components/Icon'
import { ActivityFilters, applyActivityFilters, defaultActivityFilters } from '@/components/ActivityFilters'
import type { FavoriteRow } from '@/types/database'
import { formatDateLabel, statusMeta, todayIso, typeMeta } from '@/lib/format'
import { missingForActivity } from '@/lib/coverage'

/**
 * Lista simple de actividades del guía (como la "Agenda" de la demo
 * original): cada tarjeta muestra tipo, nombre, fecha/hora, lugar y un
 * resumen de cobertura; al tocarla se abre el detalle (GuiaActividadDetalle),
 * donde están los Atletas Líder y la acción de acompañar.
 *
 * Filtros (calcados de la demo v2.2): primera fila con tipo + rango de fecha;
 * segunda fila con un dropdown de Atleta Líder (cada uno con su estrella de
 * favorito propia) y un toggle "Favoritos" que limita la lista a las
 * actividades que involucran a Atletas Líder marcados por ESTE guía.
 */
export function GuiaActividades() {
  const navigate = useNavigate()
  const { profile } = useAuth()
  const { notify } = useToast()
  const athletesQ = useAthletes()
  const activitiesQ = useActivities()
  const needsQ = useNeeds()
  const assignmentsQ = useAssignments()
  const favoritesQ = useFavorites()
  const favToggle = useToggleFavorite()

  const [filters, setFilters] = useState(defaultActivityFilters())

  const athletes = athletesQ.data ?? []
  const activities = activitiesQ.data ?? []
  const needs = needsQ.data ?? []
  const assignments = assignmentsQ.data ?? []
  const favorites = favoritesQ.data ?? []

  const athMap = useMemo(() => new Map(athletes.map((a) => [a.id, a])), [athletes])

  // Favoritos de ESTE guía sobre Atletas Líder (fila por atleta, para pintar
  // la estrella y poder desmarcar). RLS ya limita la lista a los suyos.
  const favByAthlete = useMemo(() => {
    const m = new Map<string, FavoriteRow>()
    for (const f of favorites) if (f.athlete_id) m.set(f.athlete_id, f)
    return m
  }, [favorites])

  // Sólo actividades visibles y de hoy en adelante: las pasadas no admiten
  // anotarse y taparían las próximas (el historial propio queda en Perfil).
  const visibleActivities = useMemo(() => {
    const today = todayIso()
    // Atletas Líder activos favoritos de este guía (para el toggle "Favoritos").
    const favActiveIds = new Set([...favByAthlete.keys()].filter((id) => athMap.get(id)?.active))
    const base = activities.filter((a) => a.visible).filter((a) => !a.date || a.date >= today)
    return applyActivityFilters(base, needs, favActiveIds, filters).sort((a, b) =>
      (a.date ?? '9999').localeCompare(b.date ?? '9999'),
    )
  }, [activities, filters, needs, favByAthlete, athMap])

  if (athletesQ.isLoading || activitiesQ.isLoading || needsQ.isLoading || assignmentsQ.isLoading) {
    return <FullScreenLoader />
  }
  if (
    athletesQ.isError ||
    activitiesQ.isError ||
    needsQ.isError ||
    assignmentsQ.isError ||
    favoritesQ.isError
  ) {
    return (
      <ErrorState
        onRetry={() => {
          athletesQ.refetch()
          activitiesQ.refetch()
          needsQ.refetch()
          assignmentsQ.refetch()
          favoritesQ.refetch()
        }}
      />
    )
  }

  const toggleFavorite = async (athleteId: string) => {
    if (!profile) return
    try {
      await favToggle.mutateAsync({
        userId: profile.id,
        kind: 'lider',
        targetId: athleteId,
        existing: favByAthlete.get(athleteId),
      })
    } catch {
      notify('No se pudo actualizar el favorito. Intentá de nuevo.')
    }
  }

  return (
    <div style={{ padding: '18px 16px 8px' }}>
      <h1 style={{ fontSize: 23, marginBottom: 2 }}>Actividades</h1>
      <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 14 }}>
        Carreras, entrenamientos y eventos
      </p>

      <ActivityFilters
        value={filters}
        onChange={(patch) => setFilters((f) => ({ ...f, ...patch }))}
        athletes={athletes}
        favByAthlete={favByAthlete}
        onToggleFavorite={toggleFavorite}
      />

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
