import { useMemo, useState } from 'react'
import {
  useAthletes,
  useDeleteAthlete,
  useFavorites,
  useGuides,
  useSaveAthlete,
  useToggleAthleteActive,
  useToggleFavorite,
  type AthleteInput,
} from '@/hooks/data'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/context/ToastContext'
import { Avatar, Button, Card, EmptyState, ErrorState, FullScreenLoader } from '@/components/ui'
import { Sheet } from '@/components/Sheet'
import { TextField, SelectField, FormError } from '@/components/fields'
import { Icon } from '@/components/Icon'
import { colorForId } from '@/lib/format'
import type { AthleteRow, FavoriteRow, ProfileRow } from '@/types/database'

type Tab = 'lider' | 'guia'

const TABS: { key: Tab; label: string }[] = [
  { key: 'lider', label: 'Atletas Líder' },
  { key: 'guia', label: 'Atletas Guía' },
]

/** Comparación de nombres sin mayúsculas ni tildes (búsqueda tolerante). */
function normalize(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
}

export function AdminAtletas() {
  const { profile } = useAuth()
  const { notify } = useToast()
  const athletesQ = useAthletes()
  const guidesQ = useGuides()
  const favoritesQ = useFavorites()
  const save = useSaveAthlete()
  const toggle = useToggleAthleteActive()
  const del = useDeleteAthlete()
  const favToggle = useToggleFavorite()

  const [tab, setTab] = useState<Tab>('lider')
  const [search, setSearch] = useState('')
  const [editing, setEditing] = useState<AthleteRow | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState<AthleteRow | null>(null)
  const [form, setForm] = useState<AthleteInput>({ name: '', sport: '', category: '', gender: '' })
  const [error, setError] = useState('')

  const athletes = athletesQ.data ?? []
  const guides = guidesQ.data ?? []
  const favorites = favoritesQ.data ?? []

  // Fila de favorito por destino, para pintar la estrella y desmarcar.
  const favByAthlete = useMemo(() => {
    const m = new Map<string, FavoriteRow>()
    for (const f of favorites) if (f.athlete_id) m.set(f.athlete_id, f)
    return m
  }, [favorites])
  const favByGuide = useMemo(() => {
    const m = new Map<string, FavoriteRow>()
    for (const f of favorites) if (f.guide_id) m.set(f.guide_id, f)
    return m
  }, [favorites])

  const query = normalize(search.trim())

  // Favoritos primero, después alfabético (la base ya ordena por nombre).
  const filteredAthletes = useMemo(() => {
    const list = query ? athletes.filter((a) => normalize(a.name).includes(query)) : athletes
    return [...list].sort(
      (a, b) => Number(favByAthlete.has(b.id)) - Number(favByAthlete.has(a.id)),
    )
  }, [athletes, query, favByAthlete])

  const filteredGuides = useMemo(() => {
    const list = query ? guides.filter((g) => normalize(g.full_name).includes(query)) : guides
    return [...list].sort(
      (a, b) => Number(favByGuide.has(b.id)) - Number(favByGuide.has(a.id)),
    )
  }, [guides, query, favByGuide])

  const toggleFavorite = async (kind: Tab, targetId: string, existing?: FavoriteRow) => {
    if (!profile) return
    try {
      await favToggle.mutateAsync({ userId: profile.id, kind, targetId, existing })
    } catch {
      notify('No se pudo actualizar el favorito. Intentá de nuevo.')
    }
  }

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
    if (!form.name.trim()) return setError('Ingresá el nombre del Atleta Líder.')
    try {
      await save.mutateAsync({ id: editing?.id, input: form })
      notify(editing ? 'Atleta Líder actualizado' : 'Atleta Líder creado')
      setSheetOpen(false)
    } catch {
      setError('No se pudo guardar. Intentá de nuevo.')
    }
  }

  const doDelete = async () => {
    if (!confirmDelete) return
    try {
      await del.mutateAsync(confirmDelete.id)
      notify('Atleta Líder eliminado')
    } catch {
      notify('No se pudo eliminar.')
    } finally {
      setConfirmDelete(null)
    }
  }

  if (athletesQ.isLoading || guidesQ.isLoading || favoritesQ.isLoading) return <FullScreenLoader />
  if (athletesQ.isError || guidesQ.isError || favoritesQ.isError) {
    return (
      <ErrorState
        onRetry={() => {
          athletesQ.refetch()
          guidesQ.refetch()
          favoritesQ.refetch()
        }}
      />
    )
  }

  return (
    <div style={{ padding: '18px 16px 8px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <h1 style={{ fontSize: 23 }}>Atletas</h1>
        {tab === 'lider' && (
          <Button onClick={openCreate} style={{ padding: '10px 16px', fontSize: 13.5 }}>
            <Icon glyph="plus" size={16} color="#fff" /> Atleta Líder
          </Button>
        )}
      </div>

      {/* Pestañas Atletas Líder / Atletas Guía */}
      <div
        role="tablist"
        aria-label="Elegir entre Atletas Líder y Atletas Guía"
        style={{
          display: 'flex',
          gap: 4,
          padding: 4,
          borderRadius: 'var(--radius-pill)',
          background: 'var(--surface-sunken)',
          marginBottom: 12,
        }}
      >
        {TABS.map((t) => (
          <button
            key={t.key}
            role="tab"
            aria-selected={tab === t.key}
            onClick={() => setTab(t.key)}
            style={{
              flex: 1,
              padding: '9px 8px',
              borderRadius: 'var(--radius-pill)',
              border: 'none',
              background: tab === t.key ? 'var(--surface-card)' : 'transparent',
              boxShadow: tab === t.key ? 'var(--shadow-xs)' : 'none',
              color: tab === t.key ? 'var(--color-primary)' : 'var(--text-muted)',
              fontWeight: 800,
              fontSize: 13.5,
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Buscador por nombre */}
      <div style={{ position: 'relative', marginBottom: 14 }}>
        <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', display: 'flex' }}>
          <Icon glyph="search" size={17} color="var(--text-muted)" />
        </span>
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={tab === 'lider' ? 'Buscar Atleta Líder por nombre' : 'Buscar Atleta Guía por nombre'}
          aria-label={tab === 'lider' ? 'Buscar Atleta Líder por nombre' : 'Buscar Atleta Guía por nombre'}
          maxLength={120}
          style={{
            width: '100%',
            padding: '12px 15px 12px 42px',
            borderRadius: 'var(--radius-pill)',
            border: '1.5px solid var(--border-subtle)',
            background: 'var(--surface-card)',
            color: 'var(--text-strong)',
            fontSize: 15,
            fontWeight: 600,
            outline: 'none',
          }}
        />
      </div>

      {tab === 'lider' ? (
        <LiderList
          athletes={filteredAthletes}
          searching={Boolean(query)}
          favByAthlete={favByAthlete}
          onFavorite={(a) => toggleFavorite('lider', a.id, favByAthlete.get(a.id))}
          onCreate={openCreate}
          onEdit={openEdit}
          onToggleActive={(a) => toggle.mutate({ id: a.id, active: !a.active })}
          onDelete={setConfirmDelete}
        />
      ) : (
        <GuiaList
          guides={filteredGuides}
          searching={Boolean(query)}
          favByGuide={favByGuide}
          onFavorite={(g) => toggleFavorite('guia', g.id, favByGuide.get(g.id))}
        />
      )}

      <Sheet open={sheetOpen} onClose={() => setSheetOpen(false)} title={editing ? 'Editar Atleta Líder' : 'Nuevo Atleta Líder'}>
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
          {editing ? 'Guardar cambios' : 'Guardar Atleta Líder'}
        </Button>
      </Sheet>

      <Sheet open={!!confirmDelete} onClose={() => setConfirmDelete(null)} title="Eliminar Atleta Líder">
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

function LiderList({
  athletes,
  searching,
  favByAthlete,
  onFavorite,
  onCreate,
  onEdit,
  onToggleActive,
  onDelete,
}: {
  athletes: AthleteRow[]
  searching: boolean
  favByAthlete: Map<string, FavoriteRow>
  onFavorite: (a: AthleteRow) => void
  onCreate: () => void
  onEdit: (a: AthleteRow) => void
  onToggleActive: (a: AthleteRow) => void
  onDelete: (a: AthleteRow) => void
}) {
  if (athletes.length === 0) {
    return searching ? (
      <EmptyState
        icon={<Icon glyph="search" size={28} color="var(--fde-cyan)" />}
        title="Sin resultados"
        body="No encontramos ningún Atleta Líder con ese nombre."
      />
    ) : (
      <EmptyState
        icon={<Icon glyph="users" size={28} color="var(--fde-cyan)" />}
        title="Sin Atletas Líder"
        body="Agregá el primer Atleta Líder de la fundación."
        action={<Button onClick={onCreate}>Agregar Atleta Líder</Button>}
      />
    )
  }
  return (
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
            <StarButton name={a.name} active={favByAthlete.has(a.id)} onClick={() => onFavorite(a)} />
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <ActionBtn glyph="edit" label="Editar" onClick={() => onEdit(a)} />
            <ActionBtn
              glyph={a.active ? 'eyeoff' : 'eye'}
              label={a.active ? 'Desactivar' : 'Activar'}
              onClick={() => onToggleActive(a)}
            />
            <ActionBtn glyph="trash" label="Eliminar" danger onClick={() => onDelete(a)} />
          </div>
        </Card>
      ))}
    </div>
  )
}

function GuiaList({
  guides,
  searching,
  favByGuide,
  onFavorite,
}: {
  guides: ProfileRow[]
  searching: boolean
  favByGuide: Map<string, FavoriteRow>
  onFavorite: (g: ProfileRow) => void
}) {
  if (guides.length === 0) {
    return searching ? (
      <EmptyState
        icon={<Icon glyph="search" size={28} color="var(--fde-cyan)" />}
        title="Sin resultados"
        body="No encontramos ningún Atleta Guía con ese nombre."
      />
    ) : (
      <EmptyState
        icon={<Icon glyph="users" size={28} color="var(--fde-cyan)" />}
        title="Sin Atletas Guía"
        body="Todavía no se registró ningún Atleta Guía en la app."
      />
    )
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {guides.map((g) => (
        <Card key={g.id} style={{ padding: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Avatar initials={g.initials || 'U'} color={colorForId(g.id)} size={44} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 800, fontSize: 15, color: 'var(--text-heading)' }}>{g.full_name}</div>
              <div
                style={{
                  fontSize: 12.5,
                  color: 'var(--text-muted)',
                  fontWeight: 600,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {g.email}
              </div>
            </div>
            <StarButton name={g.full_name} active={favByGuide.has(g.id)} onClick={() => onFavorite(g)} />
          </div>
        </Card>
      ))}
    </div>
  )
}

/** Estrella de favorito (marcar/desmarcar). */
function StarButton({ name, active, onClick }: { name: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      aria-label={active ? `Quitar a ${name} de favoritos` : `Marcar a ${name} como favorito`}
      aria-pressed={active}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 38,
        height: 38,
        flex: '0 0 38px',
        borderRadius: '50%',
        border: 'none',
        background: active ? '#fef6e0' : 'var(--surface-sunken)',
        cursor: 'pointer',
      }}
    >
      <Icon
        glyph="star"
        size={19}
        color={active ? '#e6a817' : 'var(--text-muted)'}
        fill={active ? '#f5c542' : 'none'}
      />
    </button>
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
