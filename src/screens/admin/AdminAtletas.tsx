import { useState } from 'react'
import { useAthletes, useDeleteAthlete, useSaveAthlete, useToggleAthleteActive, type AthleteInput } from '@/hooks/data'
import { useToast } from '@/context/ToastContext'
import { Avatar, Button, Card, EmptyState, ErrorState, FullScreenLoader } from '@/components/ui'
import { Sheet } from '@/components/Sheet'
import { TextField, SelectField, FormError } from '@/components/fields'
import { Icon } from '@/components/Icon'
import type { AthleteRow } from '@/types/database'

export function AdminAtletas() {
  const { notify } = useToast()
  const athletesQ = useAthletes()
  const save = useSaveAthlete()
  const toggle = useToggleAthleteActive()
  const del = useDeleteAthlete()

  const [editing, setEditing] = useState<AthleteRow | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState<AthleteRow | null>(null)
  const [form, setForm] = useState<AthleteInput>({ name: '', sport: '', category: '', gender: '' })
  const [error, setError] = useState('')

  const athletes = athletesQ.data ?? []

  const openCreate = () => {
    setEditing(null)
    setForm({ name: '', sport: '', category: '', gender: '' })
    setError('')
    setSheetOpen(true)
  }
  const openEdit = (a: AthleteRow) => {
    setEditing(a)
    setForm({ name: a.name, sport: a.sport, category: a.category, gender: a.gender })
    setError('')
    setSheetOpen(true)
  }

  const submit = async () => {
    if (!form.name.trim()) return setError('Ingresá el nombre del atleta.')
    try {
      await save.mutateAsync({ id: editing?.id, input: form })
      notify(editing ? 'Atleta actualizado' : 'Atleta creado')
      setSheetOpen(false)
    } catch {
      setError('No se pudo guardar. Intentá de nuevo.')
    }
  }

  const doDelete = async () => {
    if (!confirmDelete) return
    try {
      await del.mutateAsync(confirmDelete.id)
      notify('Atleta eliminado')
    } catch {
      notify('No se pudo eliminar.')
    } finally {
      setConfirmDelete(null)
    }
  }

  if (athletesQ.isLoading) return <FullScreenLoader />
  if (athletesQ.isError) return <ErrorState onRetry={() => athletesQ.refetch()} />

  return (
    <div style={{ padding: '18px 16px 8px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <h1 style={{ fontSize: 23 }}>Atletas</h1>
        <Button onClick={openCreate} style={{ padding: '10px 16px', fontSize: 13.5 }}>
          <Icon glyph="plus" size={16} color="#fff" /> Atleta
        </Button>
      </div>

      {athletes.length === 0 ? (
        <EmptyState
          icon={<Icon glyph="users" size={28} color="var(--fde-cyan)" />}
          title="Sin atletas"
          body="Agregá el primer atleta líder de la fundación."
          action={<Button onClick={openCreate}>Agregar atleta</Button>}
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {athletes.map((a) => (
            <Card key={a.id} style={{ padding: 14, opacity: a.active ? 1 : 0.6 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <Avatar initials={a.initials} color={a.color} size={44} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 800, fontSize: 15, color: 'var(--text-heading)' }}>{a.name}</div>
                  <div style={{ fontSize: 12.5, color: 'var(--text-muted)', fontWeight: 600 }}>
                    {a.sport}
                    {a.category ? ` · ${a.category}` : ''}
                  </div>
                </div>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 800,
                    padding: '4px 9px',
                    borderRadius: 'var(--radius-pill)',
                    background: a.active ? 'var(--fde-emerald-50)' : 'var(--surface-sunken)',
                    color: a.active ? 'var(--fde-pine)' : 'var(--text-muted)',
                  }}
                >
                  {a.active ? 'Activo' : 'Inactivo'}
                </span>
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                <ActionBtn glyph="edit" label="Editar" onClick={() => openEdit(a)} />
                <ActionBtn
                  glyph={a.active ? 'eyeoff' : 'eye'}
                  label={a.active ? 'Desactivar' : 'Activar'}
                  onClick={() => toggle.mutate({ id: a.id, active: !a.active })}
                />
                <ActionBtn glyph="trash" label="Eliminar" danger onClick={() => setConfirmDelete(a)} />
              </div>
            </Card>
          ))}
        </div>
      )}

      <Sheet open={sheetOpen} onClose={() => setSheetOpen(false)} title={editing ? 'Editar atleta' : 'Nuevo atleta'}>
        <FormError>{error}</FormError>
        <TextField label="Nombre completo *" id="an" maxLength={120} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Nombre y apellido" />
        <TextField label="Deporte" id="as" maxLength={60} value={form.sport} onChange={(e) => setForm({ ...form, sport: e.target.value })} placeholder="Atletismo, Natación…" />
        <TextField label="Categoría" id="ac" maxLength={60} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="Opcional" />
        <SelectField label="Género" id="ag" value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}>
          <option value="">Sin especificar</option>
          <option value="F">Femenino</option>
          <option value="M">Masculino</option>
          <option value="X">Otro</option>
        </SelectField>
        <Button full loading={save.isPending} onClick={submit} style={{ marginTop: 4 }}>
          {editing ? 'Guardar cambios' : 'Guardar atleta'}
        </Button>
      </Sheet>

      <Sheet open={!!confirmDelete} onClose={() => setConfirmDelete(null)} title="Eliminar atleta">
        <p style={{ fontSize: 14.5, color: 'var(--text-body)', lineHeight: 1.6, marginBottom: 16 }}>
          ¿Eliminar a <b style={{ color: 'var(--text-heading)' }}>{confirmDelete?.name}</b>? Se quitarán sus inscripciones y
          acompañamientos. Esta acción no se puede deshacer.
        </p>
        <Button full variant="danger" loading={del.isPending} onClick={doDelete}>
          Eliminar
        </Button>
      </Sheet>
    </div>
  )
}

function ActionBtn({ glyph, label, onClick, danger }: { glyph: 'edit' | 'eye' | 'eyeoff' | 'trash'; label: string; onClick: () => void; danger?: boolean }) {
  return (
    <button
      onClick={onClick}
      style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 5,
        padding: '9px',
        borderRadius: 'var(--radius-sm)',
        border: 'none',
        background: danger ? '#fdecea' : 'var(--surface-sunken)',
        color: danger ? '#c0392b' : 'var(--text-body)',
        fontWeight: 800,
        fontSize: 12.5,
      }}
    >
      <Icon glyph={glyph} size={15} color={danger ? '#c0392b' : 'var(--text-body)'} /> {label}
    </button>
  )
}
