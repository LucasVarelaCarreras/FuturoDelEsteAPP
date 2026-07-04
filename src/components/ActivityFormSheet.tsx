import { useEffect, useState } from 'react'
import { Sheet } from './Sheet'
import { Button } from './ui'
import { TextField, SelectField, FormError } from './fields'
import { useSaveActivity, type ActivityInput } from '@/hooks/data'
import { useToast } from '@/context/ToastContext'
import type { ActivityRow, ActivityType } from '@/types/database'

interface Props {
  open: boolean
  onClose: () => void
  activity?: ActivityRow | null
}

const EMPTY: ActivityInput = { name: '', type: 'carrera', date: '', time: '', place: '', description: '' }

/** Horas 00–23 más la opción vacía, como en la demo. */
const HOUR_OPTIONS = [
  { value: '', label: 'Hora' },
  ...Array.from({ length: 24 }, (_, i) => {
    const hh = String(i).padStart(2, '0')
    return { value: hh, label: hh }
  }),
]

/** Minutos limitados a 00 / 15 / 30 / 45 (más la opción vacía), como la demo. */
const MINUTE_OPTIONS = [
  { value: '', label: 'Min' },
  { value: '00', label: '00' },
  { value: '15', label: '15' },
  { value: '30', label: '30' },
  { value: '45', label: '45' },
]

const timeSelectStyle = {
  flex: 1,
  minWidth: 0,
  padding: '13px 15px',
  borderRadius: 'var(--radius-sm)',
  border: '1.5px solid var(--border-subtle)',
  background: 'var(--surface-card)',
  color: 'var(--text-strong)',
  fontSize: 16,
  fontWeight: 600,
  outline: 'none',
} as const

/**
 * Selector de hora como en la demo: hora (00–23) y minutos limitados a
 * 00/15/30/45, componiendo "HH:MM" (si falta una parte se completa con 00).
 */
function TimeField({ time, onChange }: { time: string; onChange: (time: string) => void }) {
  const [hour = '', minute = ''] = time.split(':')

  const setPart = (which: 'h' | 'm', v: string) => {
    const h = which === 'h' ? v : hour
    const m = which === 'm' ? v : minute
    if (h && m) onChange(`${h}:${m}`)
    else if (h) onChange(`${h}:00`)
    else if (m) onChange(`00:${m}`)
    else onChange('')
  }

  return (
    <div style={{ marginBottom: 14 }}>
      <label
        htmlFor="acth"
        style={{ display: 'block', fontSize: 13, fontWeight: 800, color: 'var(--text-heading)', marginBottom: 7 }}
      >
        Hora
      </label>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <select id="acth" aria-label="Hora" value={hour} onChange={(e) => setPart('h', e.target.value)} style={timeSelectStyle}>
          {HOUR_OPTIONS.map((o) => (
            <option key={o.value || 'none'} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <span style={{ fontWeight: 800, fontSize: 16, color: 'var(--text-muted)' }}>:</span>
        <select aria-label="Minutos" value={minute} onChange={(e) => setPart('m', e.target.value)} style={timeSelectStyle}>
          {MINUTE_OPTIONS.map((o) => (
            <option key={o.value || 'none'} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}

/** Hoja para crear o editar una actividad (reutilizada en lista y detalle). */
export function ActivityFormSheet({ open, onClose, activity }: Props) {
  const { notify } = useToast()
  const save = useSaveActivity()
  const [form, setForm] = useState<ActivityInput>(EMPTY)
  const [error, setError] = useState('')

  useEffect(() => {
    if (open) {
      setForm(
        activity
          ? {
              name: activity.name,
              type: activity.type,
              date: activity.date ?? '',
              time: activity.time,
              place: activity.place,
              description: activity.description,
            }
          : EMPTY,
      )
      setError('')
    }
  }, [open, activity])

  const submit = async () => {
    if (!form.name.trim()) return setError('Ingresá el nombre de la actividad.')
    try {
      await save.mutateAsync({ id: activity?.id, input: form })
      notify(activity ? 'Actividad actualizada' : 'Actividad creada')
      onClose()
    } catch {
      setError('No se pudo guardar. Intentá de nuevo.')
    }
  }

  return (
    <Sheet open={open} onClose={onClose} title={activity ? 'Editar actividad' : 'Nueva actividad'}>
      <FormError>{error}</FormError>
      <TextField label="Nombre *" id="actn" maxLength={140} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ej: Carrera 10K Montevideo" />
      <SelectField label="Tipo" id="actt" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as ActivityType })}>
        <option value="carrera">Carrera</option>
        <option value="entrenamiento">Entrenamiento</option>
        <option value="evento">Evento</option>
      </SelectField>
      <TextField label="Fecha" id="actd" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
      <TimeField time={form.time ?? ''} onChange={(time) => setForm({ ...form, time })} />
      <TextField label="Lugar" id="actp" maxLength={160} value={form.place} onChange={(e) => setForm({ ...form, place: e.target.value })} placeholder="Ubicación" />
      <TextField label="Descripción" id="actdesc" maxLength={1000} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Opcional" />
      <Button full loading={save.isPending} onClick={submit} style={{ marginTop: 4 }}>
        {activity ? 'Guardar cambios' : 'Crear actividad'}
      </Button>
    </Sheet>
  )
}
