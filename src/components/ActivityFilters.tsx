import { useMemo, useState } from 'react'
import { Icon } from '@/components/Icon'
import type { ActivityType, AthleteRow, FavoriteRow } from '@/types/database'
import { formatShortDate } from '@/lib/format'

/** Valor controlado de los filtros de Actividades (tipo, fecha, Atleta Líder, favoritos). */
export interface ActivityFiltersValue {
  type: ActivityType | 'all'
  dateFrom: string
  dateTo: string
  athleteId: string | null
  favOnly: boolean
}

export function defaultActivityFilters(): ActivityFiltersValue {
  return { type: 'all', dateFrom: '', dateTo: '', athleteId: null, favOnly: false }
}

export function hasActiveActivityFilters(v: ActivityFiltersValue): boolean {
  return v.type !== 'all' || Boolean(v.dateFrom) || Boolean(v.dateTo) || Boolean(v.athleteId) || v.favOnly
}

interface NeedLike {
  activity_id: string
  athlete_id: string
}

/**
 * Aplica los filtros (tipo, rango de fecha, Atleta Líder, favoritos) a una
 * lista de actividades. Compartida por GuiaActividades y AdminActividades
 * para que el resultado sea idéntico en ambas pantallas.
 */
export function applyActivityFilters<T extends { id: string; type: ActivityType; date: string | null }>(
  activities: T[],
  needs: NeedLike[],
  favActiveAthleteIds: Set<string>,
  v: ActivityFiltersValue,
): T[] {
  return activities
    .filter((a) => v.type === 'all' || a.type === v.type)
    .filter((a) => !v.dateFrom || (a.date ?? '') >= v.dateFrom)
    .filter((a) => !v.dateTo || (a.date ?? '') <= v.dateTo)
    .filter((a) => !v.athleteId || needs.some((n) => n.activity_id === a.id && n.athlete_id === v.athleteId))
    .filter((a) => !v.favOnly || needs.some((n) => n.activity_id === a.id && favActiveAthleteIds.has(n.athlete_id)))
}

const TYPE_OPTIONS: { key: ActivityType | 'all'; label: string; glyph: string }[] = [
  { key: 'all', label: 'Todas', glyph: 'grid' },
  { key: 'carrera', label: 'Carreras', glyph: 'activity' },
  { key: 'entrenamiento', label: 'Entrenamientos', glyph: 'dumbbell' },
  { key: 'evento', label: 'Eventos', glyph: 'star' },
]

function dateRangeLabel(dateFrom: string, dateTo: string): string {
  if (dateFrom && dateTo) return `${formatShortDate(dateFrom)} – ${formatShortDate(dateTo)}`
  if (dateFrom) return `Desde ${formatShortDate(dateFrom)}`
  if (dateTo) return `Hasta ${formatShortDate(dateTo)}`
  return 'Fecha'
}

interface ActivityFiltersProps {
  value: ActivityFiltersValue
  onChange: (patch: Partial<ActivityFiltersValue>) => void
  athletes: AthleteRow[]
  favByAthlete: Map<string, FavoriteRow>
  onToggleFavorite: (athleteId: string) => void
}

/**
 * Fila 1 (tipo + fecha, cada uno un botón `flex:1` con dropdown/popover
 * anclado) y fila 2 (Atleta Líder con estrella de favorito + toggle
 * Favoritos), calcadas de la demo v2.2. La usan GuiaActividades y
 * AdminActividades para garantizar filtros pixel-iguales.
 */
export function ActivityFilters({ value, onChange, athletes, favByAthlete, onToggleFavorite }: ActivityFiltersProps) {
  const [openMenu, setOpenMenu] = useState<'type' | 'date' | 'ath' | null>(null)

  const athOptions = useMemo(() => {
    const active = athletes.filter((a) => a.active)
    return [...active].sort((a, b) => Number(favByAthlete.has(b.id)) - Number(favByAthlete.has(a.id)))
  }, [athletes, favByAthlete])

  const athMap = useMemo(() => new Map(athletes.map((a) => [a.id, a])), [athletes])
  const selectedAthlete = value.athleteId ? athMap.get(value.athleteId) : null

  const typeActive = value.type !== 'all'
  const dateActive = Boolean(value.dateFrom || value.dateTo)
  const typeLabel = TYPE_OPTIONS.find((o) => o.key === value.type)?.label ?? 'Todas'

  const clearAll = () => {
    onChange(defaultActivityFilters())
    setOpenMenu(null)
  }

  return (
    <>
      {openMenu && (
        <div onClick={() => setOpenMenu(null)} style={{ position: 'fixed', inset: 0, zIndex: 6 }} aria-hidden="true" />
      )}

      {/* Fila 1 — filtro por tipo + filtro por rango de fecha */}
      <div style={{ display: 'flex', gap: 9, marginBottom: 8, position: 'relative', zIndex: 7 }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 0 }}>
          <button
            onClick={() => setOpenMenu((m) => (m === 'type' ? null : 'type'))}
            aria-label="Filtrar por tipo"
            aria-expanded={openMenu === 'type'}
            style={filterButtonStyle(typeActive)}
          >
            <span style={filterButtonLabelWrap}>
              <Icon glyph="filter" size={15} color="currentColor" />
              <span style={ellipsis}>{typeLabel}</span>
            </span>
            <Icon glyph="chevron" size={16} color="currentColor" />
          </button>
          {openMenu === 'type' && (
            <div role="listbox" style={dropdownAnchorStyle}>
              {TYPE_OPTIONS.map((o) => {
                const active = value.type === o.key
                return (
                  <button
                    key={o.key}
                    onClick={() => {
                      onChange({ type: o.key })
                      setOpenMenu(null)
                    }}
                    style={dropdownRowStyle(active)}
                  >
                    <Icon glyph={o.glyph as never} size={16} color="currentColor" />
                    <span style={{ flex: 1, minWidth: 0 }}>{o.label}</span>
                    {active && <Icon glyph="check" size={16} color="var(--fde-cyan)" />}
                  </button>
                )
              })}
            </div>
          )}
        </div>

        <div style={{ position: 'relative', flex: 1, minWidth: 0 }}>
          <button
            onClick={() => setOpenMenu((m) => (m === 'date' ? null : 'date'))}
            aria-label="Filtrar por fecha"
            aria-expanded={openMenu === 'date'}
            style={filterButtonStyle(dateActive)}
          >
            <span style={filterButtonLabelWrap}>
              <Icon glyph="calendar" size={15} color="currentColor" />
              <span style={ellipsis}>{dateRangeLabel(value.dateFrom, value.dateTo)}</span>
            </span>
            <Icon glyph="chevron" size={16} color="currentColor" />
          </button>
          {openMenu === 'date' && (
            <div
              style={{
                position: 'absolute',
                top: 'calc(100% + 7px)',
                right: 0,
                width: 248,
                maxWidth: '80vw',
                background: 'var(--surface-card)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 16,
                boxShadow: '0 14px 38px rgba(17,37,50,0.18)',
                padding: 14,
                zIndex: 30,
              }}
            >
              <label>
                <span style={dateFieldLabel}>Desde</span>
                <input
                  type="date"
                  value={value.dateFrom}
                  onChange={(e) => onChange({ dateFrom: e.target.value })}
                  aria-label="Fecha inicial"
                  style={dateInput}
                />
              </label>
              <label style={{ display: 'block', marginTop: 12 }}>
                <span style={dateFieldLabel}>Hasta</span>
                <input
                  type="date"
                  value={value.dateTo}
                  onChange={(e) => onChange({ dateTo: e.target.value })}
                  aria-label="Fecha final"
                  style={dateInput}
                />
              </label>
              <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
                <button
                  onClick={() => onChange({ dateFrom: '', dateTo: '' })}
                  style={{ flex: 1, padding: 10, borderRadius: 'var(--radius-pill)', border: '1.5px solid var(--border-strong)', background: 'var(--surface-card)', color: 'var(--text-muted)', fontWeight: 800, fontSize: 13 }}
                >
                  Limpiar
                </button>
                <button
                  onClick={() => setOpenMenu(null)}
                  style={{ flex: 1, padding: 10, borderRadius: 'var(--radius-pill)', border: 'none', background: 'var(--color-primary)', color: '#fff', fontWeight: 800, fontSize: 13 }}
                >
                  Listo
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Fila 2 — dropdown de Atleta Líder (con estrellas de favorito) + toggle Favoritos */}
      <div style={{ display: 'flex', gap: 9, marginBottom: 10, position: 'relative', zIndex: 7 }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 0 }}>
          <button
            onClick={() => setOpenMenu((m) => (m === 'ath' ? null : 'ath'))}
            aria-label="Filtrar por Atleta Líder"
            aria-expanded={openMenu === 'ath'}
            style={filterButtonStyle(Boolean(selectedAthlete))}
          >
            <span style={filterButtonLabelWrap}>
              <Icon glyph="user" size={15} color="currentColor" />
              <span style={ellipsis}>{selectedAthlete ? selectedAthlete.name : 'Atleta Líder'}</span>
            </span>
            <Icon glyph="chevron" size={16} color="currentColor" />
          </button>

          {openMenu === 'ath' && (
            <div role="listbox" style={{ ...dropdownAnchorStyle, maxHeight: 264, overflowY: 'auto' }}>
              <button
                onClick={() => {
                  onChange({ athleteId: null })
                  setOpenMenu(null)
                }}
                style={dropdownRowStyle(!value.athleteId)}
              >
                <Icon glyph="users" size={16} color="currentColor" />
                <span style={{ flex: 1, minWidth: 0 }}>Todos los atletas</span>
                {!value.athleteId && <Icon glyph="check" size={16} color="var(--fde-cyan)" />}
              </button>
              <div style={{ height: 1, background: 'var(--border-subtle)', margin: '5px 8px' }} />

              {athOptions.length === 0 ? (
                <div style={{ padding: '10px 10px', fontSize: 13, color: 'var(--text-muted)', fontWeight: 700 }}>
                  No hay Atletas Líder activos.
                </div>
              ) : (
                athOptions.map((a) => {
                  const selected = value.athleteId === a.id
                  const isFav = favByAthlete.has(a.id)
                  return (
                    <div
                      key={a.id}
                      style={{ display: 'flex', alignItems: 'center', background: selected ? 'var(--fde-cyan-50)' : 'transparent', borderRadius: 11 }}
                    >
                      <button
                        onClick={() => {
                          onChange({ athleteId: a.id })
                          setOpenMenu(null)
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
                        onClick={() => onToggleFavorite(a.id)}
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
                        <Icon glyph="star" size={16} color={isFav ? '#e6a817' : 'var(--text-muted)'} fill={isFav ? '#f5c542' : 'none'} />
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
          onClick={() => onChange({ favOnly: !value.favOnly })}
          aria-pressed={value.favOnly}
          aria-label="Filtrar solo favoritos"
          style={{
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            gap: 9,
            padding: '9px 11px',
            borderRadius: 'var(--radius-md)',
            border: '1.5px solid ' + (value.favOnly ? '#e6a817' : 'var(--border-subtle)'),
            background: value.favOnly ? '#fef6e0' : 'var(--surface-card)',
            color: value.favOnly ? '#a9760d' : 'var(--text-body)',
            fontWeight: 800,
            fontSize: 13,
          }}
        >
          <Icon glyph="star" size={15} color="currentColor" fill={value.favOnly ? '#f5c542' : 'none'} />
          <span>Favoritos</span>
          <span
            style={{
              width: 38,
              height: 22,
              borderRadius: 999,
              background: value.favOnly ? '#f5c542' : 'var(--border-strong)',
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
                transform: value.favOnly ? 'translateX(16px)' : 'translateX(0)',
                transition: 'transform .18s ease',
              }}
            />
          </span>
        </button>
      </div>

      {hasActiveActivityFilters(value) && (
        <button
          onClick={clearAll}
          style={{
            alignSelf: 'flex-start',
            display: 'flex',
            alignItems: 'center',
            gap: 5,
            marginBottom: 12,
            background: 'none',
            border: 'none',
            color: 'var(--fde-cyan-700)',
            fontWeight: 800,
            fontSize: 12.5,
            padding: 0,
            cursor: 'pointer',
          }}
        >
          <Icon glyph="x" size={14} color="var(--fde-cyan-700)" /> Limpiar filtros
        </button>
      )}
    </>
  )
}

const ellipsis = { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } as const

const filterButtonLabelWrap = { display: 'flex', alignItems: 'center', gap: 7, minWidth: 0 } as const

function filterButtonStyle(active: boolean) {
  return {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    padding: '10px 12px',
    borderRadius: 'var(--radius-md)',
    border: '1.5px solid ' + (active ? 'var(--color-primary)' : 'var(--border-subtle)'),
    background: active ? 'var(--fde-cyan-50)' : 'var(--surface-card)',
    color: active ? 'var(--fde-cyan-700)' : 'var(--text-body)',
    fontWeight: 800,
    fontSize: 13,
    cursor: 'pointer',
  } as const
}

const dropdownAnchorStyle = {
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
} as const

function dropdownRowStyle(active: boolean) {
  return {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    gap: 9,
    background: active ? 'var(--fde-cyan-50)' : 'transparent',
    border: 'none',
    color: active ? 'var(--fde-cyan-700)' : 'var(--text-body)',
    fontWeight: 800,
    fontSize: 13.5,
    padding: '10px 10px',
    borderRadius: 11,
    textAlign: 'left',
    cursor: 'pointer',
  } as const
}

const dateFieldLabel = { display: 'block', fontSize: 11.5, fontWeight: 800, color: 'var(--text-muted)', marginBottom: 5 } as const

const dateInput = {
  width: '100%',
  minWidth: 0,
  padding: '11px 12px',
  borderRadius: 12,
  border: '1.5px solid var(--border-strong)',
  fontFamily: 'var(--font-sans)',
  fontSize: 14,
  color: 'var(--text-heading)',
  background: 'var(--surface-card)',
  outline: 'none',
} as const
