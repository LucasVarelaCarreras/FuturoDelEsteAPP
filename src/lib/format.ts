import type { ActivityType } from '@/types/database'

const DIAS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
const MESES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']

/** Formatea una fecha ISO (YYYY-MM-DD) a etiqueta corta en español. */
export function formatDateLabel(iso: string | null): string {
  if (!iso) return 'A definir'
  const [y, m, d] = iso.split('-').map(Number)
  if (!y || !m || !d) return 'A definir'
  const date = new Date(y, m - 1, d)
  return `${DIAS[date.getDay()]} ${date.getDate()} ${MESES[date.getMonth()]}`
}

/** Fecha corta "15 Jul" a partir de un ISO (YYYY-MM-DD), para labels de filtro. */
export function formatShortDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number)
  if (!y || !m || !d) return iso
  return `${d} ${MESES[m - 1]}`
}

/** Fecha local de hoy en formato ISO (YYYY-MM-DD), sin desfase de zona horaria. */
export function todayIso(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

/**
 * true si la actividad (fecha+hora) ya pasó respecto al momento actual.
 * Sin fecha, nunca se considera pasada. Con fecha de hoy pero sin hora, se
 * considera vigente todo el día (no hay forma de saber si ya pasó).
 */
export function isActivityPast(date: string | null, time: string | null): boolean {
  if (!date) return false
  const today = todayIso()
  if (date < today) return true
  if (date > today) return false
  if (!time) return false
  const now = new Date()
  const [h, m] = time.split(':').map(Number)
  const nowMinutes = now.getHours() * 60 + now.getMinutes()
  return h * 60 + (m || 0) < nowMinutes
}

/** Iniciales a partir de un nombre completo. */
export function initialsFrom(name: string): string {
  const parts = name.trim().split(/\s+/)
  const a = parts[0]?.[0] ?? ''
  const b = parts[1]?.[0] ?? ''
  return (a + b).toUpperCase() || 'U'
}

const BRAND_COLORS = [
  'var(--fde-cyan)',
  'var(--fde-emerald)',
  'var(--fde-ocean)',
  'var(--fde-aqua)',
  'var(--fde-blue)',
  'var(--fde-pine)',
]

/** Normaliza un texto para búsquedas: minúsculas y sin tildes. */
export function searchKey(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

/** Color de marca determinístico según un id (para avatares). */
export function colorForId(id: string): string {
  let hash = 0
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) >>> 0
  return BRAND_COLORS[hash % BRAND_COLORS.length]
}

export interface TypeMeta {
  glyph: string
  label: string
  tileBg: string
  tileColor: string
}

export function typeMeta(t: ActivityType): TypeMeta {
  if (t === 'entrenamiento')
    return {
      glyph: 'dumbbell',
      label: 'Entrenamiento',
      tileBg: 'var(--fde-emerald-50)',
      tileColor: 'var(--fde-pine)',
    }
  if (t === 'evento')
    return { glyph: 'star', label: 'Evento', tileBg: '#e7f1fa', tileColor: 'var(--fde-ocean)' }
  return { glyph: 'activity', label: 'Carrera', tileBg: 'var(--fde-cyan-50)', tileColor: 'var(--fde-cyan)' }
}

export interface StatusMeta {
  key: 0 | 1 | 2
  bg: string
  text: string
  strong: string
  label: string
  glyph: string
}

/** Estado de cobertura de un cupo (confirmados vs requeridos). */
export function statusMeta(confirmed: number, required: number): StatusMeta {
  if (confirmed === 0)
    return { key: 0, bg: '#fdecea', text: '#c0392b', strong: '#d9534f', label: 'Sin acompañante', glyph: 'alert' }
  if (confirmed < required)
    return {
      key: 1,
      bg: '#fbf0d8',
      text: '#8a5d0c',
      strong: '#e8a21c',
      label: `Faltan ${required - confirmed}`,
      glyph: 'clock',
    }
  return { key: 2, bg: '#e4f4ec', text: '#15734d', strong: '#1e9e6a', label: 'Completo', glyph: 'check' }
}
