import type { ActivityRow, AssignmentRow, AthleteRow, NeedRow } from '@/types/database'
import { Avatar, Card } from './ui'
import { Icon } from './Icon'
import { confirmedFor, slots } from '@/lib/coverage'
import { formatDateLabel, statusMeta, typeMeta } from '@/lib/format'

interface NeedCardProps {
  need: NeedRow
  athlete: AthleteRow
  activity: ActivityRow
  assignments: AssignmentRow[]
  myGuideId: string
  onSign: (need: NeedRow) => void
  onCancel: (assignment: AssignmentRow) => void
}

/** Tarjeta que muestra un cupo de acompañamiento y la acción del guía. */
export function NeedCard({
  need,
  athlete,
  activity,
  assignments,
  myGuideId,
  onSign,
  onCancel,
}: NeedCardProps) {
  const confirmed = confirmedFor(assignments, activity.id, athlete.id)
  const sm = statusMeta(confirmed, need.required)
  const tm = typeMeta(activity.type)

  const myAssignmentInActivity = assignments.find(
    (a) => a.guide_id === myGuideId && a.activity_id === activity.id,
  )
  const mineThis = myAssignmentInActivity?.athlete_id === athlete.id
  const mineOther = myAssignmentInActivity && !mineThis
  const isFull = confirmed >= need.required

  return (
    <Card style={{ padding: 15 }}>
      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
        <Avatar initials={athlete.initials} color={athlete.color} size={44} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 800, fontSize: 15.5, color: 'var(--text-heading)' }}>{athlete.name}</div>
          <div style={{ fontSize: 12.5, color: 'var(--text-muted)', fontWeight: 600 }}>{athlete.sport}</div>
        </div>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            background: sm.bg,
            color: sm.text,
            fontWeight: 800,
            fontSize: 11.5,
            padding: '5px 10px',
            borderRadius: 'var(--radius-pill)',
          }}
        >
          <Icon glyph={sm.glyph as never} size={13} color={sm.text} /> {sm.label}
        </span>
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          marginTop: 12,
          padding: '10px 12px',
          background: 'var(--surface-sunken)',
          borderRadius: 'var(--radius-sm)',
        }}
      >
        <div
          style={{
            width: 34,
            height: 34,
            borderRadius: 10,
            background: tm.tileBg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flex: '0 0 34px',
          }}
        >
          <Icon glyph={tm.glyph as never} size={18} color={tm.tileColor} />
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontWeight: 800, fontSize: 13.5, color: 'var(--text-heading)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {activity.name}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>
            {formatDateLabel(activity.date)} · {activity.time || 'Hora a definir'}
          </div>
        </div>
      </div>

      {need.note && (
        <p style={{ fontSize: 12.5, color: 'var(--text-body)', marginTop: 8, fontStyle: 'italic' }}>{need.note}</p>
      )}

      <div style={{ display: 'flex', gap: 5, marginTop: 12 }}>
        {slots(confirmed, need.required, sm.strong).map((s, i) => (
          <span
            key={i}
            style={{ flex: 1, height: 6, borderRadius: 3, background: s.fill === 'transparent' ? 'var(--fde-mist)' : s.fill, border: `1px solid ${s.border}` }}
          />
        ))}
      </div>

      <div style={{ marginTop: 12 }}>
        {mineThis && myAssignmentInActivity ? (
          <button
            onClick={() => onCancel(myAssignmentInActivity)}
            style={btn('#e4f4ec', '#15734d')}
          >
            <Icon glyph="check" size={16} color="#15734d" /> Te anotaste · Cancelar
          </button>
        ) : mineOther ? (
          <button disabled style={{ ...btn('var(--surface-sunken)', 'var(--text-muted)'), cursor: 'not-allowed' }}>
            Ya acompañás a otro Atleta Líder acá
          </button>
        ) : isFull ? (
          <button disabled style={{ ...btn('var(--surface-sunken)', 'var(--text-muted)'), cursor: 'not-allowed' }}>
            <Icon glyph="check" size={16} color="var(--text-muted)" /> Cupo completo
          </button>
        ) : (
          <button onClick={() => onSign(need)} style={btn('var(--color-primary)', '#fff', 'var(--shadow-brand)')}>
            Acompañar
          </button>
        )}
      </div>
    </Card>
  )
}

function btn(bg: string, color: string, shadow?: string) {
  return {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    padding: '12px',
    borderRadius: 'var(--radius-pill)',
    border: 'none',
    background: bg,
    color,
    fontWeight: 800,
    fontSize: 14.5,
    boxShadow: shadow ?? 'none',
  } as const
}
