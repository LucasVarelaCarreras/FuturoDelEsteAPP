import { useMemo, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import {
  assignmentErrorMessage,
  useActivities,
  useAssignments,
  useAthletes,
  useCancelAssignment,
  useNeeds,
  useSignUp,
} from '@/hooks/data'
import { useToast } from '@/context/ToastContext'
import { NeedCard } from '@/components/NeedCard'
import { Sheet } from '@/components/Sheet'
import { Button, EmptyState, ErrorState, FullScreenLoader } from '@/components/ui'
import { Icon } from '@/components/Icon'
import type { ActivityType, AssignmentRow, NeedRow } from '@/types/database'
import { formatDateLabel, todayIso, typeMeta } from '@/lib/format'

const FILTERS: { key: ActivityType | 'all'; label: string }[] = [
  { key: 'all', label: 'Todas' },
  { key: 'carrera', label: 'Carreras' },
  { key: 'entrenamiento', label: 'Entrenamientos' },
  { key: 'evento', label: 'Eventos' },
]

export function GuiaActividades() {
  const { profile } = useAuth()
  const { notify } = useToast()
  const athletesQ = useAthletes()
  const activitiesQ = useActivities()
  const needsQ = useNeeds()
  const assignmentsQ = useAssignments()
  const signUp = useSignUp()
  const cancel = useCancelAssignment()

  const [filter, setFilter] = useState<ActivityType | 'all'>('all')
  const [confirmNeed, setConfirmNeed] = useState<NeedRow | null>(null)
  const [cancelAssignment, setCancelAssignment] = useState<AssignmentRow | null>(null)

  const athletes = athletesQ.data ?? []
  const activities = activitiesQ.data ?? []
  const needs = needsQ.data ?? []
  const assignments = assignmentsQ.data ?? []

  const athMap = useMemo(() => new Map(athletes.map((a) => [a.id, a])), [athletes])

  // Sólo actividades visibles y de hoy en adelante: las pasadas no admiten
  // anotarse y taparían las próximas (el historial propio queda en Perfil).
  const visibleActivities = useMemo(() => {
    const today = todayIso()
    return activities
      .filter((a) => a.visible)
      .filter((a) => !a.date || a.date >= today)
      .filter((a) => filter === 'all' || a.type === filter)
      .sort((a, b) => (a.date ?? '9999').localeCompare(b.date ?? '9999'))
  }, [activities, filter])

  if (athletesQ.isLoading || activitiesQ.isLoading || needsQ.isLoading || assignmentsQ.isLoading) {
    return <FullScreenLoader />
  }
  if (athletesQ.isError || activitiesQ.isError || needsQ.isError || assignmentsQ.isError) {
    return (
      <ErrorState
        onRetry={() => {
          athletesQ.refetch()
          activitiesQ.refetch()
          needsQ.refetch()
          assignmentsQ.refetch()
        }}
      />
    )
  }

  const confirmAthlete = confirmNeed ? athMap.get(confirmNeed.athlete_id) : null
  const confirmActivity = confirmNeed ? activities.find((a) => a.id === confirmNeed.activity_id) : null

  const doSign = async () => {
    if (!confirmNeed || !profile) return
    try {
      await signUp.mutateAsync({
        activityId: confirmNeed.activity_id,
        athleteId: confirmNeed.athlete_id,
        guideId: profile.id,
        guideName: profile.full_name,
      })
      notify('¡Te anotaste para acompañar!')
    } catch (e) {
      notify(assignmentErrorMessage(e))
    } finally {
      setConfirmNeed(null)
    }
  }

  const doCancel = async () => {
    if (!cancelAssignment) return
    try {
      await cancel.mutateAsync(cancelAssignment.id)
      notify('Acompañamiento cancelado')
    } catch {
      notify('No se pudo cancelar.')
    } finally {
      setCancelAssignment(null)
    }
  }

  return (
    <div style={{ padding: '18px 16px 8px' }}>
      <h1 style={{ fontSize: 23, marginBottom: 14 }}>Actividades</h1>

      <div className="no-scrollbar" style={{ display: 'flex', gap: 8, overflowX: 'auto', marginBottom: 18, paddingBottom: 2 }}>
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            style={{
              flex: '0 0 auto',
              padding: '8px 16px',
              borderRadius: 'var(--radius-pill)',
              border: '1.5px solid ' + (filter === f.key ? 'var(--color-primary)' : 'var(--border-subtle)'),
              background: filter === f.key ? 'var(--color-primary)' : 'var(--surface-card)',
              color: filter === f.key ? '#fff' : 'var(--text-body)',
              fontWeight: 800,
              fontSize: 13,
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {visibleActivities.length === 0 ? (
        <EmptyState icon={<Icon glyph="calendar" size={30} color="var(--fde-cyan)" />} title="Sin actividades" body="No hay actividades para este filtro." />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
          {visibleActivities.map((act) => {
            const actNeeds = needs.filter((n) => n.activity_id === act.id && athMap.get(n.athlete_id)?.active)
            const tm = typeMeta(act.type)
            return (
              <section key={act.id}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 12, background: tm.tileBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flex: '0 0 40px' }}>
                    <Icon glyph={tm.glyph as never} size={20} color={tm.tileColor} />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <h2 style={{ fontSize: 16, margin: 0 }}>{act.name}</h2>
                    <div style={{ fontSize: 12.5, color: 'var(--text-muted)', fontWeight: 600 }}>
                      {formatDateLabel(act.date)}
                      {act.time ? ` · ${act.time}` : ''}
                      {act.place ? ` · ${act.place}` : ''}
                    </div>
                  </div>
                </div>
                {act.description && (
                  <p style={{ fontSize: 13, color: 'var(--text-body)', lineHeight: 1.5, margin: '0 0 10px', paddingLeft: 50 }}>
                    {act.description}
                  </p>
                )}
                {actNeeds.length === 0 ? (
                  <p style={{ fontSize: 13, color: 'var(--text-muted)', paddingLeft: 50 }}>Todavía no hay atletas inscriptos.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {actNeeds.map((n) => (
                      <NeedCard
                        key={n.id}
                        need={n}
                        athlete={athMap.get(n.athlete_id)!}
                        activity={act}
                        assignments={assignments}
                        myGuideId={profile!.id}
                        onSign={setConfirmNeed}
                        onCancel={setCancelAssignment}
                      />
                    ))}
                  </div>
                )}
              </section>
            )
          })}
        </div>
      )}

      <Sheet open={!!confirmNeed} onClose={() => setConfirmNeed(null)} title="Confirmar acompañamiento">
        {confirmAthlete && confirmActivity && (
          <div style={{ paddingBottom: 8 }}>
            <p style={{ fontSize: 14.5, color: 'var(--text-body)', lineHeight: 1.6, marginBottom: 16 }}>
              Vas a acompañar a <b style={{ color: 'var(--text-heading)' }}>{confirmAthlete.name}</b> en{' '}
              <b style={{ color: 'var(--text-heading)' }}>{confirmActivity.name}</b>.
            </p>
            <Button full loading={signUp.isPending} onClick={doSign}>
              Confirmar
            </Button>
          </div>
        )}
      </Sheet>

      <Sheet open={!!cancelAssignment} onClose={() => setCancelAssignment(null)} title="Cancelar acompañamiento">
        <div style={{ paddingBottom: 8 }}>
          <p style={{ fontSize: 14.5, color: 'var(--text-body)', lineHeight: 1.6, marginBottom: 16 }}>
            ¿Seguro que querés cancelar tu acompañamiento?
          </p>
          <Button full variant="danger" loading={cancel.isPending} onClick={doCancel}>
            Sí, cancelar
          </Button>
        </div>
      </Sheet>
    </div>
  )
}
