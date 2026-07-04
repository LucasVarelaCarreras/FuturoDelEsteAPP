import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useGuides, useToggleGuideActive, useUpdateGuideProfile, type GuideProfileInput } from '@/hooks/data'
import { useToast } from '@/context/ToastContext'
import { Button, ErrorState, FullScreenLoader } from '@/components/ui'
import { Icon } from '@/components/Icon'
import { Sheet } from '@/components/Sheet'
import { TcDetail } from '@/components/TcDetail'
import { TextField, FormError } from '@/components/fields'
import { colorForId } from '@/lib/format'

const MESES_CORTOS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']

/** Fecha de registro como en la demo: "12 mar 2025". */
function formatJoined(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  return `${d.getDate()} ${MESES_CORTOS[d.getMonth()]} ${d.getFullYear()}`
}

/**
 * Detalle completo de un Atleta Guía para el admin (calcado de la demo
 * v2.2): header con el degradé oscuro de marca, avatar, nombre y badge de
 * estado; tarjeta con Email / Teléfono / Fecha de registro / Categoría /
 * Estado; botones Editar y Activar/Desactivar; y el registro de aceptación
 * de T&C (agregado nuestro, reutiliza TcDetail en una hoja).
 */
export function AdminGuiaDetalle() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const { notify } = useToast()
  const guidesQ = useGuides()
  const update = useUpdateGuideProfile()
  const toggle = useToggleGuideActive()

  const [editOpen, setEditOpen] = useState(false)
  const [tcOpen, setTcOpen] = useState(false)
  const [form, setForm] = useState<GuideProfileInput>({ full_name: '', phone: '', category: '' })
  const [error, setError] = useState('')

  const guide = guidesQ.data?.find((g) => g.id === id)

  if (guidesQ.isLoading) return <FullScreenLoader />
  if (guidesQ.isError) return <ErrorState onRetry={() => guidesQ.refetch()} />
  if (!guide) {
    return (
      <div style={{ padding: 40, textAlign: 'center' }}>
        <p style={{ marginBottom: 16 }}>Atleta Guía no encontrado.</p>
        <Button onClick={() => navigate('/atletas')}>Volver</Button>
      </div>
    )
  }

  const color = colorForId(guide.id)
  const statusLabel = guide.active ? 'Activo' : 'Inactivo'
  const statusBg = guide.active ? 'var(--fde-emerald-50)' : 'var(--surface-sunken)'
  const statusColor = guide.active ? 'var(--fde-pine)' : 'var(--text-muted)'

  const openEdit = () => {
    setForm({ full_name: guide.full_name, phone: guide.phone, category: guide.category })
    setError('')
    setEditOpen(true)
  }

  const saveEdit = async () => {
    if (!form.full_name.trim()) return setError('Ingresá el nombre del guía.')
    try {
      await update.mutateAsync({ id: guide.id, input: form })
      notify('Guía actualizado')
      setEditOpen(false)
    } catch {
      setError('No se pudo guardar. Intentá de nuevo.')
    }
  }

  const doToggle = async () => {
    try {
      await toggle.mutateAsync({ id: guide.id, active: !guide.active })
      notify(guide.active ? 'Guía desactivado' : 'Guía activado')
    } catch {
      notify('No se pudo cambiar el estado. Intentá de nuevo.')
    }
  }

  const infoRows: [string, string][] = [
    ['Email', guide.email || '—'],
    ['Teléfono', guide.phone || '—'],
    ['Fecha de registro', formatJoined(guide.created_at)],
    ['Categoría', guide.category || '—'],
  ]

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--surface-page)' }}>
      {/* Header con el degradé oscuro de marca, como la demo */}
      <div
        style={{
          background: 'var(--gradient-deep)',
          padding: 'calc(var(--safe-top) + 16px) 20px 26px',
          borderBottomLeftRadius: 28,
          borderBottomRightRadius: 28,
          color: '#fff',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button onClick={() => navigate('/atletas')} aria-label="Volver" style={headerCircleBtn}>
            <Icon glyph="back" size={19} color="#fff" />
          </button>
          <button onClick={openEdit} aria-label="Editar guía" style={headerCircleBtn}>
            <Icon glyph="edit" size={17} color="#fff" />
          </button>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 14 }}>
          <div
            aria-hidden="true"
            style={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              background: color,
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: 22,
              flexShrink: 0,
              border: '2px solid rgba(255,255,255,0.35)',
            }}
          >
            {guide.initials || 'U'}
          </div>
          <div style={{ minWidth: 0 }}>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, lineHeight: 1.15, color: '#fff' }}>
              {guide.full_name}
            </h1>
            <div
              style={{
                marginTop: 7,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 7,
                background: 'rgba(255,255,255,0.16)',
                borderRadius: 'var(--radius-pill)',
                padding: '4px 12px',
                fontSize: 12,
                fontWeight: 800,
              }}
            >
              {statusLabel}
            </div>
          </div>
        </div>
      </div>

      <div style={{ padding: '18px 18px 6px' }}>
        <h2 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: 'var(--text-heading)' }}>Información del guía</h2>
      </div>
      <div style={{ padding: '12px 18px 8px' }}>
        <div
          style={{
            background: 'var(--surface-card)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 18,
            boxShadow: 'var(--shadow-sm)',
            overflow: 'hidden',
          }}
        >
          {infoRows.map(([label, value]) => (
            <div key={label} style={infoRow}>
              <span style={infoLabel}>{label}</span>
              <span style={infoValue}>{value}</span>
            </div>
          ))}
          <div style={{ ...infoRow, borderBottom: 'none' }}>
            <span style={infoLabel}>Estado</span>
            <span
              style={{
                background: statusBg,
                color: statusColor,
                fontSize: 11.5,
                fontWeight: 800,
                padding: '5px 11px',
                borderRadius: 'var(--radius-pill)',
              }}
            >
              {statusLabel}
            </span>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 10, padding: '10px 18px 4px' }}>
        <button onClick={openEdit} style={editBtn}>
          <Icon glyph="edit" size={17} color="currentColor" /> Editar
        </button>
        <button
          onClick={doToggle}
          disabled={toggle.isPending}
          style={{
            ...toggleBtnBase,
            background: guide.active ? '#fdecea' : 'var(--fde-emerald-50)',
            color: guide.active ? 'var(--fde-danger)' : 'var(--fde-pine)',
            opacity: toggle.isPending ? 0.6 : 1,
          }}
        >
          {guide.active ? 'Desactivar guía' : 'Activar guía'}
        </button>
      </div>

      {/* Registro de aceptación de T&C (auditoría legal) */}
      <div style={{ padding: '10px 18px calc(28px + var(--safe-bottom))' }}>
        <button
          onClick={() => setTcOpen(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            width: '100%',
            textAlign: 'left',
            padding: '14px 16px',
            background: 'var(--surface-card)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 18,
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <Icon glyph="shield" size={19} color="var(--fde-ocean)" />
          <span style={{ flex: 1, fontWeight: 800, fontSize: 14, color: 'var(--text-heading)' }}>
            Registro de aceptación de T&C
          </span>
          <Icon glyph="chevron" size={18} color="var(--text-muted)" />
        </button>
      </div>

      {/* Editar guía */}
      <Sheet open={editOpen} onClose={() => setEditOpen(false)} title="Editar guía">
        <FormError>{error}</FormError>
        <TextField
          label="Nombre"
          id="gname"
          maxLength={120}
          value={form.full_name}
          onChange={(e) => setForm({ ...form, full_name: e.target.value })}
          placeholder="Nombre y apellido"
        />
        <TextField
          label="Teléfono"
          id="gphone"
          type="tel"
          maxLength={40}
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
          placeholder="+598 99 123 456"
        />
        <TextField
          label="Categoría"
          id="gcat"
          maxLength={60}
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
          placeholder="Ej: Sub-18, Máster…"
        />
        <Button full loading={update.isPending} onClick={saveEdit} style={{ marginTop: 4 }}>
          Guardar cambios
        </Button>
      </Sheet>

      {/* Aceptación de T&C */}
      <Sheet open={tcOpen} onClose={() => setTcOpen(false)} title="Aceptación de T&C">
        {tcOpen && <TcDetail guide={guide} />}
      </Sheet>
    </div>
  )
}

const headerCircleBtn = {
  background: 'rgba(255,255,255,0.16)',
  border: 'none',
  color: '#fff',
  width: 38,
  height: 38,
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
} as const

const infoRow = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 14,
  padding: '14px 16px',
  borderBottom: '1px solid var(--border-subtle)',
} as const

const infoLabel = {
  fontSize: 12.5,
  fontWeight: 700,
  color: 'var(--text-muted)',
  flexShrink: 0,
} as const

const infoValue = {
  fontSize: 13.5,
  fontWeight: 700,
  color: 'var(--text-strong)',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
} as const

const editBtn = {
  flex: 1,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 8,
  background: 'var(--surface-card)',
  border: '1.5px solid var(--border-strong)',
  color: 'var(--text-heading)',
  fontWeight: 800,
  fontSize: 14,
  padding: 13,
  borderRadius: 'var(--radius-pill)',
  cursor: 'pointer',
} as const

const toggleBtnBase = {
  flex: 1,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 8,
  border: 'none',
  fontWeight: 800,
  fontSize: 14,
  padding: 13,
  borderRadius: 'var(--radius-pill)',
  cursor: 'pointer',
} as const
