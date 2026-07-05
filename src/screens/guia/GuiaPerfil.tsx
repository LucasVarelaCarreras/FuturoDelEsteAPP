import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/context/ToastContext'
import { useActivities, useAssignments, useLatestTermsAcceptance, useUpdateGuideProfile, type GuideProfileInput } from '@/hooks/data'
import { Avatar, Button, Card, ErrorState, FullScreenLoader } from '@/components/ui'
import { Icon } from '@/components/Icon'
import { Sheet } from '@/components/Sheet'
import { TextField, FormError } from '@/components/fields'
import { colorForId, isActivityPast } from '@/lib/format'

export function GuiaPerfil() {
  const { profile, signOut, refreshProfile } = useAuth()
  const navigate = useNavigate()
  const { notify } = useToast()
  const activitiesQ = useActivities()
  const assignmentsQ = useAssignments()
  const tcQ = useLatestTermsAcceptance(profile?.id)
  const update = useUpdateGuideProfile()

  const [editOpen, setEditOpen] = useState(false)
  const [form, setForm] = useState<GuideProfileInput>({ full_name: '', phone: '', category: '' })
  const [error, setError] = useState('')

  const actMap = useMemo(() => new Map((activitiesQ.data ?? []).map((a) => [a.id, a])), [activitiesQ.data])

  // Sólo se necesita el conteo de "próximos" para el badge del botón; el
  // detalle completo (Próximos + Historial) vive en /mis-acompanamientos.
  const upcomingCount = useMemo(() => {
    return (assignmentsQ.data ?? [])
      .filter((a) => a.guide_id === profile?.id)
      .map((a) => actMap.get(a.activity_id))
      .filter((act): act is NonNullable<typeof act> => !!act)
      .filter((act) => !isActivityPast(act.date, act.time)).length
  }, [assignmentsQ.data, profile, actMap])

  if (activitiesQ.isLoading || assignmentsQ.isLoading) return <FullScreenLoader />
  if (activitiesQ.isError || assignmentsQ.isError) {
    return (
      <ErrorState
        onRetry={() => {
          activitiesQ.refetch()
          assignmentsQ.refetch()
        }}
      />
    )
  }
  if (!profile) return null

  const openEdit = () => {
    setForm({ full_name: profile.full_name, phone: profile.phone, category: profile.category })
    setError('')
    setEditOpen(true)
  }

  const saveEdit = async () => {
    if (!form.full_name.trim()) return setError('Ingresá tu nombre.')
    try {
      await update.mutateAsync({ id: profile.id, input: form })
      await refreshProfile()
      notify('Perfil actualizado')
      setEditOpen(false)
    } catch {
      setError('No se pudo guardar. Intentá de nuevo.')
    }
  }

  return (
    <div style={{ padding: '18px 16px 8px' }}>
      <button
        onClick={openEdit}
        aria-label="Editar mi perfil"
        style={{
          width: '100%',
          marginBottom: 20,
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          padding: 18,
          background: 'var(--surface-card)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          boxShadow: 'var(--shadow-xs)',
          textAlign: 'left',
          cursor: 'pointer',
        }}
      >
        <Avatar initials={profile.initials || 'U'} color={colorForId(profile.id)} size={56} src={profile.avatar_url} />
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ fontWeight: 800, fontSize: 18, color: 'var(--text-heading)' }}>{profile.full_name}</div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis' }}>{profile.email}</div>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, marginTop: 6, background: 'var(--fde-cyan-50)', color: 'var(--fde-cyan-700)', fontWeight: 800, fontSize: 11.5, padding: '4px 10px', borderRadius: 'var(--radius-pill)' }}>
            <Icon glyph="heart" size={12} color="var(--fde-cyan-700)" /> Atleta Guía
          </span>
        </div>
        <Icon glyph="edit" size={18} color="var(--text-muted)" />
      </button>

      <button
        onClick={() => navigate('/mis-acompanamientos')}
        aria-label="Ver mis acompañamientos"
        style={{
          width: '100%',
          marginBottom: 20,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: 16,
          background: 'var(--surface-card)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          boxShadow: 'var(--shadow-xs)',
          textAlign: 'left',
          cursor: 'pointer',
        }}
      >
        <div
          style={{
            width: 42,
            height: 42,
            flex: '0 0 42px',
            borderRadius: 14,
            background: 'var(--fde-cyan-50)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon glyph="calendar" size={20} color="var(--fde-cyan-700)" />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 800, fontSize: 15, color: 'var(--text-heading)' }}>Mis acompañamientos</div>
          <div style={{ fontSize: 12.5, color: 'var(--text-muted)', fontWeight: 600, marginTop: 2 }}>
            {upcomingCount > 0 ? `${upcomingCount} próximo${upcomingCount === 1 ? '' : 's'}` : 'Ver historial completo'}
          </div>
        </div>
        {upcomingCount > 0 && (
          <span
            style={{
              flexShrink: 0,
              minWidth: 22,
              height: 22,
              padding: '0 6px',
              borderRadius: 'var(--radius-pill)',
              background: 'var(--color-primary)',
              color: '#fff',
              fontWeight: 800,
              fontSize: 12,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {upcomingCount}
          </span>
        )}
        <Icon glyph="chevron" size={18} color="var(--text-muted)" />
      </button>

      <h2 style={{ fontSize: 16, margin: '0 0 12px' }}>Términos y Condiciones</h2>
      <Card style={{ padding: 16 }}>
        {tcQ.data ? (
          <div style={{ fontSize: 13.5, color: 'var(--text-body)', lineHeight: 1.8 }}>
            <Row label="Aceptado el" value={new Date(tcQ.data.accepted_at).toLocaleString('es-UY')} />
            <Row label="Versión" value={tcQ.data.doc_version} />
          </div>
        ) : (
          <p style={{ fontSize: 13.5, color: 'var(--text-muted)' }}>Sin registro de aceptación.</p>
        )}
      </Card>

      <button
        onClick={() => signOut()}
        style={{
          width: '100%',
          marginTop: 22,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          padding: 14,
          borderRadius: 'var(--radius-pill)',
          border: '1.5px solid var(--border-subtle)',
          background: 'var(--surface-card)',
          color: 'var(--fde-danger)',
          fontWeight: 800,
          fontSize: 14.5,
        }}
      >
        <Icon glyph="logout" size={18} color="var(--fde-danger)" /> Cerrar sesión
      </button>

      <p style={{ textAlign: 'center', fontSize: 11.5, color: 'var(--text-muted)', marginTop: 18 }}>
        Fundación Futuro del Este · v1.0.0
      </p>

      {/* Editar mi perfil: el email no se muestra (espejo del de auth,
          protegido por trigger) ni el estado activo/rol (protegidos por
          protect_profile_role, sólo un admin puede tocarlos). */}
      <Sheet open={editOpen} onClose={() => setEditOpen(false)} title="Editar mi perfil">
        <FormError>{error}</FormError>
        <TextField
          label="Nombre"
          id="myname"
          maxLength={120}
          value={form.full_name}
          onChange={(e) => setForm({ ...form, full_name: e.target.value })}
          placeholder="Nombre y apellido"
        />
        <TextField
          label="Teléfono"
          id="myphone"
          type="tel"
          maxLength={40}
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
          placeholder="+598 99 123 456"
        />
        <TextField
          label="Categoría"
          id="mycat"
          maxLength={60}
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
          placeholder="Ej: Sub-18, Máster…"
        />
        <Button full loading={update.isPending} onClick={saveEdit} style={{ marginTop: 4 }}>
          Guardar cambios
        </Button>
      </Sheet>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
      <span style={{ color: 'var(--text-muted)', fontWeight: 700 }}>{label}</span>
      <span style={{ fontWeight: 700, textAlign: 'right' }}>{value}</span>
    </div>
  )
}
