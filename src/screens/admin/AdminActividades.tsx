import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  useActivities,
  useAssignments,
  useAthletes,
  useFavorites,
  useNeeds,
  useToggleActivityVisible,
  useToggleFavorite,
} from '@/hooks/data'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/context/ToastContext'
import { Button, Card, EmptyState, ErrorState, FullScreenLoader } from '@/components/ui'
import { Icon } from '@/components/Icon'
import { ActivityFormSheet } from '@/components/ActivityFormSheet'
import { ActivityFilters, applyActivityFilters, defaultActivityFilters, hasActiveActivityFilters } from '@/components/ActivityFilters'
import type { FavoriteRow } from '@/types/database'
import { formatDateLabel, isActivityPast, typeMeta } from '@/lib/format'
import { missingForActivity } from '@/lib/coverage'

/**
 * Mismos filtros exactos que GuiaActividades (tipo, rango de fecha, Atleta
 * Líder con su estrella de favorito y toggle Favoritos), pedido explícito
 * del usuario para no tener comportamientos distintos entre admin y guía.
 * Los favoritos usados acá son los del propio admin (misma tabla
 * `athlete_favorites`, RLS por `user_id`, igual que en AdminAtletas).
 */
export function AdminActividades() {
  const navigate = useNavigate()
  const { profile } = useAuth()
  const { notify } = useToast()
  const activitiesQ = useActivities()
  const athletesQ = useAthletes()
  const needsQ = useNeeds()
  const assignmentsQ = useAssignments()
  const favoritesQ = useFavorites()
  const favToggle = useToggleFavorite()
  const toggleVisible = useToggleActivityVisible()
  const [sheetOpen, setSheetOpen] = useState(false)
  const [filters, setFilters] = useState(defaultActivityFilters())

  const athletes = athletesQ.data ?? []
  const activities = activitiesQ.data ?? []
  const needs = needsQ.data ?? []
  const assignments = assignmentsQ.data ?? []
  const favorites = favoritesQ.data ?? []

  const athMap = useMemo(() => new Map(athletes.map((a) => [a.id, a])), [athletes])

  // Favoritos de ESTE admin sobre Atletas Líder (misma lógica que AdminAtletas).
  const favByAthlete = useMemo(() => {
    const m = new Map<string, FavoriteRow>()
    for (const f of favorites) if (f.athlete_id) m.set(f.athlete_id, f)
    return m
  }, [favorites])

  const sorted = useMemo(() => {
    const favActiveIds = new Set([...favByAthlete.keys()].filter((id) => athMap.get(id)?.active))
    const filtered = applyActivityFilters(activities, needs, favActiveIds, filters)
    // Primero las futuras/vigentes (más próxima primero), después las
    // finalizadas (la más recientemente finalizada primero): de lo
    // contrario, con el tiempo, las finalizadas más viejas terminaban
    // arriba de todo y enterraban las futuras.
    const upcoming = filtered
      .filter((a) => !isActivityPast(a.date, a.time))
      .sort((a, b) => (a.date ?? '9999').localeCompare(b.date ?? '9999'))
    const past = filtered
      .filter((a) => isActivityPast(a.date, a.time))
      .sort((a, b) => (b.date ?? '0000').localeCompare(a.date ?? '0000'))
    return [...upcoming, ...past]
  }, [activities, needs, filters, favByAthlete, athMap])

  // Para el badge "Faltan N" sólo cuentan atletas activos: los inactivos no
  // se muestran a los guías (y el servidor rechaza anotarse con ellos).
  const openNeeds = useMemo(() => {
    const activeIds = new Set(athletes.filter((a) => a.active).map((a) => a.id))
    return needs.filter((n) => activeIds.has(n.athlete_id))
  }, [needs, athletes])

  if (activitiesQ.isLoading || athletesQ.isLoading || needsQ.isLoading || assignmentsQ.isLoading)
    return <FullScreenLoader />
  if (activitiesQ.isError || athletesQ.isError || needsQ.isError || assignmentsQ.isError || favoritesQ.isError) {
    return (
      <ErrorState
        onRetry={() => {
          activitiesQ.refetch()
          athletesQ.refetch()
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
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <h1 style={{ fontSize: 23 }}>Actividades</h1>
        <Button onClick={() => setSheetOpen(true)} style={{ padding: '10px 16px', fontSize: 13.5 }}>
          <Icon glyph="plus" size={16} color="#fff" /> Actividad
        </Button>
      </div>

      <ActivityFilters
        value={filters}
        onChange={(patch) => setFilters((f) => ({ ...f, ...patch }))}
        athletes={athletes}
        favByAthlete={favByAthlete}
        onToggleFavorite={toggleFavorite}
      />

      {sorted.length === 0 ? (
        hasActiveActivityFilters(filters) ? (
          <EmptyState
            icon={<Icon glyph="calendar" size={28} color="var(--fde-cyan)" />}
            title="Sin actividades"
            body="No hay actividades para este filtro."
          />
        ) : (
          <EmptyState
            icon={<Icon glyph="calendar" size={28} color="var(--fde-cyan)" />}
            title="Sin actividades"
            body="Creá la primera actividad de la fundación."
            action={<Button onClick={() => setSheetOpen(true)}>Crear actividad</Button>}
          />
        )
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {sorted.map((act) => {
            const tm = typeMeta(act.type)
            const isPast = isActivityPast(act.date, act.time)
            const missing = missingForActivity(openNeeds, assignments, act.id)
            return (
              <Card key={act.id} style={{ padding: 14 }}>
                <button
                  onClick={() => navigate(`/actividad/${act.id}`)}
                  style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', background: 'none', border: 'none', textAlign: 'left', padding: 0 }}
                >
                  <div style={{ width: 42, height: 42, borderRadius: 12, background: tm.tileBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flex: '0 0 42px' }}>
                    <Icon glyph={tm.glyph as never} size={20} color={tm.tileColor} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 800, fontSize: 15, color: 'var(--text-heading)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{act.name}</div>
                    <div style={{ fontSize: 12.5, color: 'var(--text-muted)', fontWeight: 600 }}>
                      {formatDateLabel(act.date)}
                      {act.time ? ` · ${act.time}` : ''}
                    </div>
                  </div>
                  <Icon glyph="chevron" size={18} color="var(--text-muted)" />
                </button>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12 }}>
                  <span
                    style={{
                      fontSize: 11.5,
                      fontWeight: 800,
                      padding: '4px 10px',
                      borderRadius: 'var(--radius-pill)',
                      background: isPast
                        ? 'var(--surface-sunken)'
                        : missing > 0
                          ? '#fbf0d8'
                          : 'var(--fde-emerald-50)',
                      color: isPast ? 'var(--text-muted)' : missing > 0 ? '#8a5d0c' : 'var(--fde-pine)',
                    }}
                  >
                    {isPast ? 'Finalizada' : missing > 0 ? `Faltan ${missing}` : 'Completo'}
                  </span>
                  <button
                    onClick={() => {
                      toggleVisible.mutate({ id: act.id, visible: !act.visible })
                      notify(act.visible ? 'Actividad oculta' : 'Actividad visible')
                    }}
                    style={{
                      marginLeft: 'auto',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 5,
                      padding: '7px 12px',
                      borderRadius: 'var(--radius-pill)',
                      border: '1.5px solid var(--border-subtle)',
                      background: 'var(--surface-card)',
                      color: 'var(--text-body)',
                      fontWeight: 800,
                      fontSize: 12,
                    }}
                  >
                    <Icon glyph={act.visible ? 'eye' : 'eyeoff'} size={14} color="var(--text-body)" />
                    {act.visible ? 'Visible' : 'Oculta'}
                  </button>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      <ActivityFormSheet open={sheetOpen} onClose={() => setSheetOpen(false)} />
    </div>
  )
}
