import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useActivities, useAssignments, useNeeds, useToggleActivityVisible } from '@/hooks/data'
import { useToast } from '@/context/ToastContext'
import { Button, Card, EmptyState, FullScreenLoader } from '@/components/ui'
import { Icon } from '@/components/Icon'
import { ActivityFormSheet } from '@/components/ActivityFormSheet'
import { formatDateLabel, typeMeta } from '@/lib/format'
import { missingForActivity } from '@/lib/coverage'

export function AdminActividades() {
  const navigate = useNavigate()
  const { notify } = useToast()
  const activitiesQ = useActivities()
  const needsQ = useNeeds()
  const assignmentsQ = useAssignments()
  const toggleVisible = useToggleActivityVisible()
  const [sheetOpen, setSheetOpen] = useState(false)

  const activities = activitiesQ.data ?? []
  const needs = needsQ.data ?? []
  const assignments = assignmentsQ.data ?? []

  const sorted = useMemo(
    () => [...activities].sort((a, b) => (a.date ?? '9999').localeCompare(b.date ?? '9999')),
    [activities],
  )

  if (activitiesQ.isLoading || needsQ.isLoading || assignmentsQ.isLoading) return <FullScreenLoader />

  return (
    <div style={{ padding: '18px 16px 8px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <h1 style={{ fontSize: 23 }}>Actividades</h1>
        <Button onClick={() => setSheetOpen(true)} style={{ padding: '10px 16px', fontSize: 13.5 }}>
          <Icon glyph="plus" size={16} color="#fff" /> Actividad
        </Button>
      </div>

      {sorted.length === 0 ? (
        <EmptyState
          icon={<Icon glyph="calendar" size={28} color="var(--fde-cyan)" />}
          title="Sin actividades"
          body="Creá la primera actividad de la fundación."
          action={<Button onClick={() => setSheetOpen(true)}>Crear actividad</Button>}
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {sorted.map((act) => {
            const tm = typeMeta(act.type)
            const missing = missingForActivity(needs, assignments, act.id)
            return (
              <Card key={act.id} style={{ padding: 14 }}>
                <button
                  onClick={() => navigate(`/actividad/${act.id}`)}
                  style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', background: 'none', border: 'none', textAlign: 'left', padding: 0 }}
                >
                  <div style={{ width: 42, height: 42, borderRadius: 12, background: tm.tileBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flex: '0 0 42px' }}>
                    <Icon glyph={tm.glyph as never} size={20} color={tm.tileColor} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 800, fontSize: 15, color: 'var(--text-heading)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{act.name}</div>
                    <div style={{ fontSize: 12.5, color: 'var(--text-muted)', fontWeight: 600 }}>
                      {formatDateLabel(act.date)}
                      {act.time ? ` · ${act.time}` : ''}
                    </div>
                  </div>
                  <Icon glyph="chevron" size={18} color="var(--text-muted)" />
                </button>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12 }}>
                  <span
                    style={{
                      fontSize: 11.5,
                      fontWeight: 800,
                      padding: '4px 10px',
                      borderRadius: 'var(--radius-pill)',
                      background: missing > 0 ? '#fbf0d8' : 'var(--fde-emerald-50)',
                      color: missing > 0 ? '#8a5d0c' : 'var(--fde-pine)',
                    }}
                  >
                    {missing > 0 ? `Faltan ${missing}` : 'Completo'}
                  </span>
                  <button
                    onClick={() => {
                      toggleVisible.mutate({ id: act.id, visible: !act.visible })
                      notify(act.visible ? 'Actividad oculta' : 'Actividad visible')
                    }}
                    style={{
                      marginLeft: 'auto',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 5,
                      padding: '7px 12px',
                      borderRadius: 'var(--radius-pill)',
                      border: '1.5px solid var(--border-subtle)',
                      background: 'var(--surface-card)',
                      color: 'var(--text-body)',
                      fontWeight: 800,
                      fontSize: 12,
                    }}
                  >
                    <Icon glyph={act.visible ? 'eye' : 'eyeoff'} size={14} color="var(--text-body)" />
                    {act.visible ? 'Visible' : 'Oculta'}
                  </button>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      <ActivityFormSheet open={sheetOpen} onClose={() => setSheetOpen(false)} />
    </div>
  )
}
