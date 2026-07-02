import { useMemo, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useActivities, useAssignments, useAthletes, useCancelAssignment, useNeeds, useSignUp } from '@/hooks/data'
import { useToast } from '@/context/ToastContext'
import { NeedCard } from '@/components/NeedCard'
import { Sheet } from '@/components/Sheet'
import { Button, EmptyState, FullScreenLoader } from '@/components/ui'
import { Icon } from '@/components/Icon'
import type { AssignmentRow, NeedRow } from '@/types/database'
import { confirmedFor } from '@/lib/coverage'
import { formatDateLabel } from '@/lib/format'

export function GuiaInicio() {
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
  const activities = activitiesQ.data ?? []
  const needs = needsQ.data ?? []
  const assignments = assignmentsQ.data ?? []

  const athMap = useMemo(() => new Map(athletes.map((a) => [a.id, a])), [athletes])
  const actMap = useMemo(() => new Map(activities.map((a) => [a.id, a])), [activities])

  // Cupos abiertos: actividad visible, atleta activo y cobertura incompleta.
  const openRows = useMemo(() => {
    return needs
      .map((n) => ({ need: n, ath: athMap.get(n.athlete_id), act: actMap.get(n.activity_id) }))
      .filter((r) => r.ath?.active && r.act?.visible)
      .filter((r) => confirmedFor(assignments, r.act!.id, r.ath!.id) < r.need.required)
      .sort((a, b) => (a.act!.date ?? '9999').localeCompare(b.act!.date ?? '9999'))
  }, [needs, athMap, actMap, assignments])

  const myAssignments = useMemo(
    () => assignments.filter((a) => a.guide_id === profile?.id),
    [assignments, profile],
  )

  if (athletesQ.isLoading || activitiesQ.isLoading || needsQ.isLoading || assignmentsQ.isLoading) {
    return <FullScreenLoader />
  }

  const confirmAthlete = confirmNeed ? athMap.get(confirmNeed.athlete_id) : null
  const confirmActivity = confirmNeed ? actMap.get(confirmNeed.activity_id) : null

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
      const msg = (e as Error).message.toLowerCase()
      notify(msg.includes('duplicate') ? 'Ya estás anotado en esta actividad.' : 'No se pudo completar. Intentá de nuevo.')
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
      notify('No se pudo cancelar. Intentá de nuevo.')
    } finally {
      setCancelAssignment(null)
    }
  }

  return (
    <div style={{ padding: '18px 16px 8px' }}>
      <h1 style={{ fontSize: 23, marginBottom: 2 }}>Hola, {profile?.full_name.split(' ')[0]} 👋</h1>
      <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 16 }}>
        {myAssignments.length > 0
          ? `Tenés ${myAssignments.length} acompañamiento${myAssignments.length > 1 ? 's' : ''} confirmado${myAssignments.length > 1 ? 's' : ''}.`
          : 'Elegí un atleta para acompañar en la próxima actividad.'}
      </p>

      <SummaryStrip openCount={openRows.length} mineCount={myAssignments.length} />

      <h2 style={{ fontSize: 16, margin: '20px 0 12px' }}>Cupos abiertos</h2>

      {openRows.length === 0 ? (
        <EmptyState
          icon={<Icon glyph="checkcircle" size={30} color="var(--fde-success)" />}
          title="¡Todo cubierto!"
          body="No hay cupos abiertos por ahora. Volvé más tarde para nuevas actividades."
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {openRows.map((r) => (
            <NeedCard
              key={r.need.id}
              need={r.need}
              athlete={r.ath!}
              activity={r.act!}
              assignments={assignments}
              myGuideId={profile!.id}
              onSign={setConfirmNeed}
              onCancel={setCancelAssignment}
            />
          ))}
        </div>
      )}

      {/* Confirmar acompañamiento */}
      <Sheet open={!!confirmNeed} onClose={() => setConfirmNeed(null)} title="Confirmar acompañamiento">
        {confirmAthlete && confirmActivity && (
          <div style={{ paddingBottom: 8 }}>
            <p style={{ fontSize: 14.5, color: 'var(--text-body)', lineHeight: 1.6, marginBottom: 16 }}>
              Vas a acompañar a <b style={{ color: 'var(--text-heading)' }}>{confirmAthlete.name}</b> en{' '}
              <b style={{ color: 'var(--text-heading)' }}>{confirmActivity.name}</b> ({formatDateLabel(confirmActivity.date)}
              {confirmActivity.time ? ` · ${confirmActivity.time}` : ''}).
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

function SummaryStrip({ openCount, mineCount }: { openCount: number; mineCount: number }) {
  const items = [
    { label: 'Cupos abiertos', value: openCount, color: 'var(--fde-cyan)' },
    { label: 'Mis acompañamientos', value: mineCount, color: 'var(--fde-emerald)' },
  ]
  return (
    <div style={{ display: 'flex', gap: 10 }}>
      {items.map((it) => (
        <div
          key={it.label}
          style={{
            flex: 1,
            background: 'var(--surface-card)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: 14,
            boxShadow: 'var(--shadow-xs)',
          }}
        >
          <div style={{ fontSize: 26, fontWeight: 900, color: it.color, lineHeight: 1 }}>{it.value}</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 700, marginTop: 5 }}>{it.label}</div>
        </div>
      ))}
    </div>
  )
}
