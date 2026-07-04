import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  MAX_REQUIRED,
  useActivities,
  useAddGuideAssignment,
  useAddNeed,
  useAssignments,
  useAthletes,
  useDeleteActivity,
  useGuides,
  useNeeds,
  useRemoveGuideAssignment,
  useRemoveNeed,
  useSetRequired,
} from '@/hooks/data'
import { useToast } from '@/context/ToastContext'
import { Avatar, Button, Card, ErrorState, FullScreenLoader, Spinner } from '@/components/ui'
import { Icon } from '@/components/Icon'
import { Sheet } from '@/components/Sheet'
import { ActivityFormSheet } from '@/components/ActivityFormSheet'
import { confirmedFor } from '@/lib/coverage'
import { formatDateLabel, statusMeta, typeMeta } from '@/lib/format'
import type { NeedRow } from '@/types/database'

export function AdminActividadDetalle() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const { notify } = useToast()

  const activitiesQ = useActivities()
  const athletesQ = useAthletes()
  const needsQ = useNeeds()
  const assignmentsQ = useAssignments()
  const guidesQ = useGuides()

  const setRequired = useSetRequired()
  const removeNeed = useRemoveNeed()
  const addNeed = useAddNeed()
  const addGuide = useAddGuideAssignment()
  const removeGuide = useRemoveGuideAssignment()
  const delActivity = useDeleteActivity()

  const [editOpen, setEditOpen] = useState(false)
  const [confirmDelAct, setConfirmDelAct] = useState(false)
  const [pickAthleteOpen, setPickAthleteOpen] = useState(false)
  const [pickGuideFor, setPickGuideFor] = useState<NeedRow | null>(null)
  const [confirmRemoveNeed, setConfirmRemoveNeed] = useState<NeedRow | null>(null)

  const activity = activitiesQ.data?.find((a) => a.id === id)
  const athletes = athletesQ.data ?? []
  const needs = useMemo(() => (needsQ.data ?? []).filter((n) => n.activity_id === id), [needsQ.data, id])
  const assignments = assignmentsQ.data ?? []
  const guides = guidesQ.data ?? []

  const athMap = useMemo(() => new Map(athletes.map((a) => [a.id, a])), [athletes])

  if (activitiesQ.isLoading || athletesQ.isLoading || needsQ.isLoading || assignmentsQ.isLoading) {
    return <FullScreenLoader />
  }
  if (activitiesQ.isError || athletesQ.isError || needsQ.isError || assignmentsQ.isError) {
    return (
      <ErrorState
        onRetry={() => {
          activitiesQ.refetch()
          athletesQ.refetch()
          needsQ.refetch()
          assignmentsQ.refetch()
        }}
      />
    )
  }
  if (!activity) {
    return (
      <div style={{ padding: 40, textAlign: 'center' }}>
        <p style={{ marginBottom: 16 }}>Actividad no encontrada.</p>
        <Button onClick={() => navigate('/actividades')}>Volver</Button>
      </div>
    )
  }

  const tm = typeMeta(activity.type)
  const athletesNotInActivity = athletes.filter((a) => a.active && !needs.some((n) => n.athlete_id === a.id))

  const doDeleteActivity = async () => {
    try {
      await delActivity.mutateAsync(activity.id)
      notify('Actividad eliminada')
      navigate('/actividades')
    } catch {
      notify('No se pudo eliminar.')
      setConfirmDelAct(false)
    }
  }

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--surface-page)' }}>
      {/* Encabezado */}
      <div style={{ background: tm.tileBg, padding: 'calc(var(--safe-top) + 14px) 16px 20px' }}>
        <button
          onClick={() => navigate(-1)}
          aria-label="Volver"
          style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: 'none', color: tm.tileColor, fontWeight: 800, fontSize: 14, marginBottom: 14 }}
        >
          <Icon glyph="back" size={18} color={tm.tileColor} /> Volver
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          <Icon glyph={tm.glyph as never} size={20} color={tm.tileColor} />
          <span style={{ fontWeight: 800, fontSize: 12.5, color: tm.tileColor, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{tm.label}</span>
        </div>
        <h1 style={{ fontSize: 22, marginBottom: 8 }}>{activity.name}</h1>
        <div style={{ fontSize: 13.5, color: 'var(--text-body)', fontWeight: 600 }}>
          {formatDateLabel(activity.date)}
          {activity.time ? ` · ${activity.time}` : ''}
        </div>
        {activity.place && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
            <Icon glyph="mappin" size={14} color="var(--text-muted)" /> {activity.place}
          </div>
        )}
        <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
          <Button variant="secondary" onClick={() => setEditOpen(true)} style={{ padding: '9px 16px', fontSize: 13 }}>
            <Icon glyph="edit" size={15} /> Editar
          </Button>
          <Button variant="danger" onClick={() => setConfirmDelAct(true)} style={{ padding: '9px 16px', fontSize: 13 }}>
            <Icon glyph="trash" size={15} color="#c0392b" /> Eliminar
          </Button>
        </div>
      </div>

      <div style={{ padding: '18px 16px calc(30px + var(--safe-bottom))' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <h2 style={{ fontSize: 16 }}>Atletas Líder en esta actividad</h2>
          <button
            onClick={() => setPickAthleteOpen(true)}
            style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'var(--fde-cyan-50)', border: 'none', color: 'var(--fde-cyan-700)', fontWeight: 800, fontSize: 13, padding: '8px 13px', borderRadius: 'var(--radius-pill)' }}
          >
            <Icon glyph="userplus" size={15} color="var(--fde-cyan-700)" /> Agregar
          </button>
        </div>

        {needs.length === 0 ? (
          <p style={{ fontSize: 13.5, color: 'var(--text-muted)', padding: '20px 0' }}>
            No hay Atletas Líder inscriptos. Agregá Atletas Líder para gestionar la cobertura.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {needs.map((need) => {
              const ath = athMap.get(need.athlete_id)
              if (!ath) return null
              const confirmed = confirmedFor(assignments, activity.id, ath.id)
              const sm = statusMeta(confirmed, need.required)
              const theseGuides = assignments.filter((x) => x.activity_id === activity.id && x.athlete_id === ath.id)
              return (
                <Card key={need.id} style={{ padding: 15 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <Avatar initials={ath.initials} color={ath.color} size={42} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 800, fontSize: 15, color: 'var(--text-heading)' }}>{ath.name}</div>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: sm.text, fontWeight: 800, fontSize: 11.5 }}>
                        <Icon glyph={sm.glyph as never} size={12} color={sm.text} /> {sm.label}
                      </span>
                    </div>
                    <button onClick={() => setConfirmRemoveNeed(need)} aria-label="Quitar Atleta Líder" style={{ background: 'none', border: 'none', padding: 6 }}>
                      <Icon glyph="trash" size={17} color="var(--text-muted)" />
                    </button>
                  </div>

                  {/* Cupos requeridos */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 14, background: 'var(--surface-sunken)', borderRadius: 'var(--radius-sm)', padding: '10px 12px' }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-body)' }}>Acompañantes requeridos</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <Stepper glyph="minus" onClick={() => setRequired.mutate({ id: need.id, required: need.required - 1 })} disabled={need.required <= 1} />
                      <span style={{ fontWeight: 900, fontSize: 17, color: 'var(--text-heading)', minWidth: 18, textAlign: 'center' }}>{need.required}</span>
                      <Stepper glyph="plus" onClick={() => setRequired.mutate({ id: need.id, required: need.required + 1 })} disabled={need.required >= MAX_REQUIRED} />
                    </div>
                  </div>

                  {/* Guías confirmados */}
                  <div style={{ marginTop: 12 }}>
                    {theseGuides.map((g) => (
                      <div key={g.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 0' }}>
                        <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--fde-emerald-50)', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: '0 0 28px' }}>
                          <Icon glyph="check" size={15} color="var(--fde-success)" />
                        </div>
                        <span style={{ flex: 1, fontSize: 13.5, fontWeight: 700, color: 'var(--text-heading)' }}>{g.guide_name || 'Acompañante'}</span>
                        <button onClick={() => removeGuide.mutate(g.id)} aria-label="Quitar acompañante" style={{ background: 'none', border: 'none', padding: 4 }}>
                          <Icon glyph="x" size={16} color="var(--text-muted)" />
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={() => setPickGuideFor(need)}
                      style={{ display: 'flex', alignItems: 'center', gap: 6, width: '100%', justifyContent: 'center', marginTop: 8, padding: '10px', borderRadius: 'var(--radius-sm)', border: '1.5px dashed var(--border-strong)', background: 'transparent', color: 'var(--text-body)', fontWeight: 800, fontSize: 13 }}
                    >
                      <Icon glyph="userplus" size={16} color="var(--text-body)" /> Sumar acompañante
                    </button>
                  </div>
                </Card>
              )
            })}
          </div>
        )}
      </div>

      <ActivityFormSheet open={editOpen} onClose={() => setEditOpen(false)} activity={activity} />

      {/* Confirmar eliminar actividad */}
      <Sheet open={confirmDelAct} onClose={() => setConfirmDelAct(false)} title="Eliminar actividad">
        <p style={{ fontSize: 14.5, color: 'var(--text-body)', lineHeight: 1.6, marginBottom: 16 }}>
          ¿Eliminar <b style={{ color: 'var(--text-heading)' }}>{activity.name}</b>? Se quitarán sus inscripciones y acompañamientos.
        </p>
        <Button full variant="danger" loading={delActivity.isPending} onClick={doDeleteActivity}>
          Eliminar
        </Button>
      </Sheet>

      {/* Quitar atleta */}
      <Sheet open={!!confirmRemoveNeed} onClose={() => setConfirmRemoveNeed(null)} title="Quitar Atleta Líder">
        <p style={{ fontSize: 14.5, color: 'var(--text-body)', lineHeight: 1.6, marginBottom: 16 }}>
          ¿Quitar a este Atleta Líder de la actividad? Se eliminarán sus acompañantes asignados.
        </p>
        <Button
          full
          variant="danger"
          loading={removeNeed.isPending}
          onClick={async () => {
            if (!confirmRemoveNeed) return
            try {
              await removeNeed.mutateAsync(confirmRemoveNeed)
              notify('Atleta Líder quitado de la actividad')
            } catch {
              notify('No se pudo quitar.')
            } finally {
              setConfirmRemoveNeed(null)
            }
          }}
        >
          Quitar
        </Button>
      </Sheet>

      {/* Elegir atleta para agregar */}
      <Sheet open={pickAthleteOpen} onClose={() => setPickAthleteOpen(false)} title="Agregar Atleta Líder">
        {athletesNotInActivity.length === 0 ? (
          <p style={{ fontSize: 13.5, color: 'var(--text-muted)', padding: '10px 0 20px' }}>Todos los Atletas Líder activos ya están en esta actividad.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingBottom: 8 }}>
            {athletesNotInActivity.map((a) => (
              <button
                key={a.id}
                onClick={async () => {
                  try {
                    await addNeed.mutateAsync({ activityId: activity.id, athleteId: a.id })
                    notify('Atleta Líder agregado')
                  } catch {
                    notify('No se pudo agregar.')
                  } finally {
                    setPickAthleteOpen(false)
                  }
                }}
                style={rowBtn}
              >
                <Avatar initials={a.initials} color={a.color} size={38} />
                <div style={{ flex: 1, textAlign: 'left' }}>
                  <div style={{ fontWeight: 800, fontSize: 14.5, color: 'var(--text-heading)' }}>{a.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{a.sport}</div>
                </div>
                <Icon glyph="plus" size={18} color="var(--color-primary)" />
              </button>
            ))}
          </div>
        )}
      </Sheet>

      {/* Elegir guía para sumar */}
      <Sheet open={!!pickGuideFor} onClose={() => setPickGuideFor(null)} title="Sumar acompañante">
        {guidesQ.isLoading ? (
          <div style={{ padding: 24, display: 'flex', justifyContent: 'center' }}>
            <Spinner />
          </div>
        ) : (
        <PickGuideList
          alreadyIds={
            pickGuideFor
              ? assignments.filter((x) => x.activity_id === activity.id).map((x) => x.guide_id ?? '')
              : []
          }
          guides={guides}
          onPick={async (guide) => {
            if (!pickGuideFor) return
            try {
              await addGuide.mutateAsync({ activityId: activity.id, athleteId: pickGuideFor.athlete_id, guide })
              notify('Acompañante sumado')
            } catch (e) {
              const msg = (e as Error).message.toLowerCase()
              notify(msg.includes('duplicate') ? 'Ese guía ya acompaña en esta actividad.' : 'No se pudo sumar.')
            } finally {
              setPickGuideFor(null)
            }
          }}
        />
        )}
      </Sheet>
    </div>
  )
}

function Stepper({ glyph, onClick, disabled }: { glyph: 'plus' | 'minus'; onClick: () => void; disabled?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={glyph === 'plus' ? 'Sumar' : 'Restar'}
      style={{
        width: 32,
        height: 32,
        borderRadius: '50%',
        border: '1.5px solid var(--border-subtle)',
        background: 'var(--surface-card)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: disabled ? 0.4 : 1,
      }}
    >
      <Icon glyph={glyph} size={16} color="var(--text-heading)" />
    </button>
  )
}

function PickGuideList({
  guides,
  alreadyIds,
  onPick,
}: {
  guides: import('@/types/database').ProfileRow[]
  alreadyIds: string[]
  onPick: (g: import('@/types/database').ProfileRow) => void
}) {
  const available = guides.filter((g) => !alreadyIds.includes(g.id))
  if (available.length === 0) {
    return <p style={{ fontSize: 13.5, color: 'var(--text-muted)', padding: '10px 0 20px' }}>No hay más guías disponibles para esta actividad.</p>
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingBottom: 8 }}>
      {available.map((g) => (
        <button key={g.id} onClick={() => onPick(g)} style={rowBtn}>
          <Avatar initials={g.initials || 'U'} color="var(--fde-ocean)" size={38} />
          <div style={{ flex: 1, textAlign: 'left' }}>
            <div style={{ fontWeight: 800, fontSize: 14.5, color: 'var(--text-heading)' }}>{g.full_name}</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis' }}>{g.email}</div>
          </div>
          <Icon glyph="plus" size={18} color="var(--color-primary)" />
        </button>
      ))}
    </div>
  )
}

const rowBtn = {
  display: 'flex',
  alignItems: 'center',
  gap: 12,
  width: '100%',
  padding: 12,
  borderRadius: 'var(--radius-md)',
  border: '1px solid var(--border-subtle)',
  background: 'var(--surface-card)',
} as const
