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
import type { ActivityType, FavoriteRow } from '@/types/database'
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

  const [filter, setFilter] = useState<ActivityType | 'all'>('all')
  const [dateOpen, setDateOpen] = useState(false)
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [athMenuOpen, setAthMenuOpen] = useState(false)
  const [athFilterId, setAthFilterId] = useState<string | null>(null)
  const [favOnly, setFavOnly] = useState(false)

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

  // Opciones del dropdown: sólo Atletas Líder activos, favoritos primero y
  // después alfabético (la base ya ordena por nombre).
  const athOptions = useMemo(() => {
    const active = athletes.filter((a) => a.active)
    return [...active].sort(
      (a, b) => Number(favByAthlete.has(b.id)) - Number(favByAthlete.has(a.id)),
    )
  }, [athletes, favByAthlete])

  const selectedAthlete = athFilterId ? athMap.get(athFilterId) : null

  // Sólo actividades visibles y de hoy en adelante: las pasadas no admiten
  // anotarse y taparían las próximas (el historial propio queda en Perfil).
  const visibleActivities = useMemo(() => {
    const today = todayIso()
    // Atletas Líder activos favoritos de este guía (para el toggle "Favoritos").
    const favActiveIds = new Set(
      [...favByAthlete.keys()].filter((id) => athMap.get(id)?.active),
    )
    return activities
      .filter((a) => a.visible)
      .filter((a) => !a.date || a.date >= today)
      .filter((a) => filter === 'all' || a.type === filter)
      .filter((a) => !dateFrom || (a.date ?? '') >= dateFrom)
      .filter((a) => !dateTo || (a.date ?? '') <= dateTo)
      // Filtro por Atleta Líder: la actividad debe tener un cupo de ese atleta.
      .filter(
        (a) =>
          !athFilterId ||
          needs.some((n) => n.activity_id === a.id && n.athlete_id === athFilterId),
      )
      // Toggle Favoritos: la actividad debe involucrar a algún favorito activo.
      .filter(
        (a) =>
          !favOnly ||
          needs.some((n) => n.activity_id === a.id && favActiveIds.has(n.athlete_id)),
      )
      .sort((a, b) => (a.date ?? '9999').localeCompare(b.date ?? '9999'))
  }, [activities, filter, dateFrom, dateTo, athFilterId, favOnly, needs, favByAthlete, athMap])

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

  const hasDateFilter = Boolean(dateFrom || dateTo)

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

      {/* Fila 1 — filtro por tipo (pills) + filtro por rango de fecha */}
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

      {/* Fila 2 — dropdown de Atleta Líder (con estrellas de favorito) + toggle Favoritos */}
      {athMenuOpen && (
        <div
          onClick={() => setAthMenuOpen(false)}
          style={{ position: 'fixed', inset: 0, zIndex: 6 }}
          aria-hidden="true"
        />
      )}
      <div style={{ display: 'flex', gap: 9, marginBottom: 12, position: 'relative', zIndex: 7 }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 0 }}>
          <button
            onClick={() => setAthMenuOpen((o) => !o)}
            aria-label="Filtrar por Atleta Líder"
            aria-expanded={athMenuOpen}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 8,
              padding: '10px 12px',
              borderRadius: 'var(--radius-md)',
              border: '1.5px solid ' + (selectedAthlete ? 'var(--color-primary)' : 'var(--border-subtle)'),
              background: selectedAthlete ? 'var(--fde-cyan-50)' : 'var(--surface-card)',
              color: selectedAthlete ? 'var(--fde-cyan-700)' : 'var(--text-body)',
              fontWeight: 800,
              fontSize: 13,
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: 7, minWidth: 0 }}>
              <Icon glyph="user" size={15} color="currentColor" />
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {selectedAthlete ? selectedAthlete.name : 'Atleta Líder'}
              </span>
            </span>
            <Icon glyph="chevron" size={16} color="currentColor" />
          </button>

          {athMenuOpen && (
            <div
              role="listbox"
              style={{
                position: 'absolute',
                top: 'calc(100% + 7px)',
                left: 0,
                right: 0,
                background: 'var(--surface-card)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 16,
                boxShadow: '0 14px 38px rgba(17,37,50,0.18)',
                padding: 6,
                zIndex: 30,
                maxHeight: 264,
                overflowY: 'auto',
              }}
            >
              {/* "Todos los atletas" arriba, con separador */}
              <button
                onClick={() => {
                  setAthFilterId(null)
                  setAthMenuOpen(false)
                }}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 9,
                  background: !athFilterId ? 'var(--fde-cyan-50)' : 'transparent',
                  border: 'none',
                  color: !athFilterId ? 'var(--fde-cyan-700)' : 'var(--text-body)',
                  fontWeight: 800,
                  fontSize: 13.5,
                  padding: '10px 10px',
                  borderRadius: 11,
                  textAlign: 'left',
                }}
              >
                <Icon glyph="users" size={16} color="currentColor" />
                <span style={{ flex: 1, minWidth: 0 }}>Todos los atletas</span>
                {!athFilterId && <Icon glyph="check" size={16} color="var(--fde-cyan)" />}
              </button>
              <div style={{ height: 1, background: 'var(--border-subtle)', margin: '5px 8px' }} />

              {athOptions.length === 0 ? (
                <div style={{ padding: '10px 10px', fontSize: 13, color: 'var(--text-muted)', fontWeight: 700 }}>
                  No hay Atletas Líder activos.
                </div>
              ) : (
                athOptions.map((a) => {
                  const selected = athFilterId === a.id
                  const isFav = favByAthlete.has(a.id)
                  return (
                    <div
                      key={a.id}
                      style={{ display: 'flex', alignItems: 'center', background: selected ? 'var(--fde-cyan-50)' : 'transparent', borderRadius: 11 }}
                    >
                      <button
                        onClick={() => {
                          setAthFilterId(a.id)
                          setAthMenuOpen(false)
                        }}
                        style={{
                          flex: 1,
                          minWidth: 0,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                          background: 'none',
                          border: 'none',
                          color: selected ? 'var(--fde-cyan-700)' : 'var(--text-body)',
                          fontWeight: 800,
                          fontSize: 13.5,
                          padding: '10px 4px 10px 10px',
                          borderRadius: 11,
                          textAlign: 'left',
                        }}
                      >
                        <span style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {a.name}
                        </span>
                        {selected && <Icon glyph="check" size={16} color="var(--fde-cyan)" />}
                      </button>
                      <button
                        onClick={() => toggleFavorite(a.id)}
                        aria-label={isFav ? `Quitar a ${a.name} de favoritos` : `Marcar a ${a.name} como favorito`}
                        aria-pressed={isFav}
                        style={{
                          flexShrink: 0,
                          width: 34,
                          height: 34,
                          margin: '0 5px 0 2px',
                          borderRadius: '50%',
                          border: 'none',
                          background: isFav ? '#fef6e0' : 'var(--surface-sunken)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                        }}
                      >
                        <Icon
                          glyph="star"
                          size={16}
                          color={isFav ? '#e6a817' : 'var(--text-muted)'}
                          fill={isFav ? '#f5c542' : 'none'}
                        />
                      </button>
                    </div>
                  )
                })
              )}
            </div>
          )}
        </div>

        {/* Toggle "Favoritos" (switch visual como la demo) */}
        <button
          onClick={() => setFavOnly((v) => !v)}
          aria-pressed={favOnly}
          aria-label="Filtrar solo favoritos"
          style={{
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            gap: 9,
            padding: '9px 11px',
            borderRadius: 'var(--radius-md)',
            border: '1.5px solid ' + (favOnly ? '#e6a817' : 'var(--border-subtle)'),
            background: favOnly ? '#fef6e0' : 'var(--surface-card)',
            color: favOnly ? '#a9760d' : 'var(--text-body)',
            fontWeight: 800,
            fontSize: 13,
          }}
        >
          <Icon glyph="star" size={15} color="currentColor" fill={favOnly ? '#f5c542' : 'none'} />
          <span>Favoritos</span>
          <span
            style={{
              width: 38,
              height: 22,
              borderRadius: 999,
              background: favOnly ? '#f5c542' : 'var(--border-strong)',
              position: 'relative',
              flexShrink: 0,
              transition: 'background .18s ease',
            }}
          >
            <span
              style={{
                position: 'absolute',
                top: 2,
                left: 2,
                width: 18,
                height: 18,
                borderRadius: '50%',
                background: '#fff',
                boxShadow: '0 1px 3px rgba(0,0,0,.25)',
                transform: favOnly ? 'translateX(16px)' : 'translateX(0)',
                transition: 'transform .18s ease',
              }}
            />
          </span>
        </button>
      </div>

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
