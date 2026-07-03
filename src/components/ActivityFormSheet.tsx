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
        <option value="evento">Evento especial</option>
      </SelectField>
      <TextField label="Fecha" id="actd" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
      <TextField label="Hora" id="acth" type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} />
      <TextField label="Lugar" id="actp" maxLength={160} value={form.place} onChange={(e) => setForm({ ...form, place: e.target.value })} placeholder="Ubicación" />
      <TextField label="Descripción" id="actdesc" maxLength={1000} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Opcional" />
      <Button full loading={save.isPending} onClick={submit} style={{ marginTop: 4 }}>
        {activity ? 'Guardar cambios' : 'Crear actividad'}
      </Button>
    </Sheet>
  )
}
