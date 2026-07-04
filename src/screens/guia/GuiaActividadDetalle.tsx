import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
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
import type { AssignmentRow, NeedRow } from '@/types/database'
import { formatDateLabel, typeMeta } from '@/lib/format'

/**
 * Detalle de una actividad para el Atleta Guía (como en la demo original):
 * header con el degradé de marca y los datos de la actividad, y debajo los
 * Atletas Líder inscriptos con su cobertura y la acción de acompañar/cancelar.
 * Sólo lectura salvo esa acción (la gestión es del admin).
 */
export function GuiaActividadDetalle() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const { profile } = useAuth()
  const { notify } = useToast()

  const athletesQ = useAthletes()
  const activitiesQ = useActivities()
  const needsQ = useNeeds()
  const assignmentsQ = useAssignments()
  const signUp = useSignUp()
  const cancel = useCancelAssignment()

  const [confirmNeed, setConfirmNeed] = useState<NeedRow | null>(null)
  const [cancelAssignment, setCancelAssignment] = useState<AssignmentRow | null>(null)

  const athletes = athletesQ.data ?? []
  const assignments = assignmentsQ.data ?? []
  const activity = activitiesQ.data?.find((a) => a.id === id)

  const athMap = useMemo(() => new Map(athletes.map((a) => [a.id, a])), [athletes])
  // Sólo cupos de Atletas Líder activos, como en el resto de la app.
  const actNeeds = useMemo(
    () => (needsQ.data ?? []).filter((n) => n.activity_id === id && athMap.get(n.athlete_id)?.active),
    [needsQ.data, id, athMap],
  )

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
  if (!activity || !activity.visible) {
    return (
      <div style={{ padding: 40, textAlign: 'center' }}>
        <p style={{ marginBottom: 16 }}>Actividad no encontrada.</p>
        <Button onClick={() => navigate('/actividades')}>Volver</Button>
      </div>
    )
  }

  const tm = typeMeta(activity.type)
  const confirmAthlete = confirmNeed ? athMap.get(confirmNeed.athlete_id) : null

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
    <div style={{ minHeight: '100dvh', background: 'var(--surface-page)' }}>
      {/* Encabezado oscuro de marca, como en la demo original */}
      <div
        style={{
          position: 'relative',
          overflow: 'hidden',
          background: 'var(--gradient-deep)',
          padding: 'calc(var(--safe-top) + 16px) 20px 26px',
          borderBottomLeftRadius: 28,
          borderBottomRightRadius: 28,
          color: '#fff',
        }}
      >
        <button
          onClick={() => navigate('/actividades')}
          aria-label="Volver"
          style={{
            background: 'rgba(255,255,255,0.16)',
            border: 'none',
            color: '#fff',
            width: 38,
            height: 38,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon glyph="back" size={19} color="#fff" />
        </button>
        <div
          style={{
            display: 'inline-flex',
            marginTop: 16,
            alignItems: 'center',
            gap: 7,
            background: 'rgba(255,255,255,0.16)',
            borderRadius: 'var(--radius-pill)',
            padding: '5px 12px',
            fontSize: 12,
            fontWeight: 800,
          }}
        >
          <Icon glyph={tm.glyph as never} size={14} color="#fff" /> {tm.label}
        </div>
        <h1 style={{ margin: '12px 0 0', fontSize: 24, lineHeight: 1.15, color: '#fff' }}>{activity.name}</h1>
        <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 7, fontSize: 13.5, color: 'rgba(255,255,255,0.85)', fontWeight: 600 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Icon glyph="calendar" size={15} color="rgba(255,255,255,0.85)" />
            {formatDateLabel(activity.date)} · {activity.time || 'Hora a definir'}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Icon glyph="mappin" size={15} color="rgba(255,255,255,0.85)" />
            {activity.place || 'Lugar a definir'}
          </div>
        </div>
        {activity.description && (
          <p style={{ margin: '14px 0 0', fontSize: 13.5, lineHeight: 1.5, color: 'rgba(255,255,255,0.78)' }}>
            {activity.description}
          </p>
        )}
      </div>

      <div style={{ padding: '20px 16px calc(30px + var(--safe-bottom))' }}>
        <h2 style={{ fontSize: 17, margin: 0 }}>Atletas Líder en esta actividad</h2>
        <p style={{ margin: '5px 0 0', fontSize: 12.5, color: 'var(--text-muted)', lineHeight: 1.45 }}>
          Podés acompañar a un solo Atleta Líder por actividad.
        </p>

        <div style={{ marginTop: 14 }}>
          {actNeeds.length === 0 ? (
            <EmptyState
              icon={<Icon glyph="users" size={28} color="var(--text-muted)" />}
              title="Sin Atletas Líder asignados"
              body="Esta actividad todavía no tiene Atletas Líder inscriptos."
            />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {actNeeds.map((n) => (
                <NeedCard
                  key={n.id}
                  need={n}
                  athlete={athMap.get(n.athlete_id)!}
                  activity={activity}
                  assignments={assignments}
                  myGuideId={profile!.id}
                  onSign={setConfirmNeed}
                  onCancel={setCancelAssignment}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Confirmar acompañamiento */}
      <Sheet open={!!confirmNeed} onClose={() => setConfirmNeed(null)} title="Confirmar acompañamiento">
        {confirmAthlete && (
          <div style={{ paddingBottom: 8 }}>
            <p style={{ fontSize: 14.5, color: 'var(--text-body)', lineHeight: 1.6, marginBottom: 16 }}>
              Vas a acompañar a <b style={{ color: 'var(--text-heading)' }}>{confirmAthlete.name}</b> en{' '}
              <b style={{ color: 'var(--text-heading)' }}>{activity.name}</b>.
            </p>
            <Button full loading={signUp.isPending} onClick={doSign}>
              Confirmar
            </Button>
          </div>
        )}
      </Sheet>

      {/* Confirmar cancelación */}
      <Sheet open={!!cancelAssignment} onClose={() => setCancelAssignment(null)} title="Cancelar acompañamiento">
        <div style={{ paddingBottom: 8 }}>
          <p style={{ fontSize: 14.5, color: 'var(--text-body)', lineHeight: 1.6, marginBottom: 16 }}>
            ¿Seguro que querés cancelar tu acompañamiento? El cupo quedará disponible para otra persona.
          </p>
          <Button full variant="danger" loading={cancel.isPending} onClick={doCancel}>
            Sí, cancelar
          </Button>
        </div>
      </Sheet>
    </div>
  )
}
