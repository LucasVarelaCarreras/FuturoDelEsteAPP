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

/** Días desde hoy hasta la fecha dada (negativo = pasado). */
export function daysUntil(iso: string | null): number | null {
  if (!iso) return null
  const [y, m, d] = iso.split('-').map(Number)
  const target = new Date(y, m - 1, d)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return Math.round((target.getTime() - today.getTime()) / 86400000)
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
    return { glyph: 'star', label: 'Evento especial', tileBg: '#e7f1fa', tileColor: 'var(--fde-ocean)' }
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

export function coveragePct(confirmed: number, required: number): number {
  return Math.min(100, Math.round((confirmed / Math.max(1, required)) * 100))
}
