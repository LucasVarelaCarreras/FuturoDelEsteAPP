import type { AssignmentRow, NeedRow } from '@/types/database'

/** Cuántos acompañantes confirmados tiene un atleta en una actividad. */
export function confirmedFor(
  assignments: AssignmentRow[],
  activityId: string,
  athleteId: string,
): number {
  return assignments.filter((a) => a.activity_id === activityId && a.athlete_id === athleteId).length
}

/** Faltantes totales de acompañantes en una actividad. */
export function missingForActivity(
  needs: NeedRow[],
  assignments: AssignmentRow[],
  activityId: string,
): number {
  return needs
    .filter((n) => n.activity_id === activityId)
    .reduce((sum, n) => sum + Math.max(0, n.required - confirmedFor(assignments, activityId, n.athlete_id)), 0)
}

/** Atletas sin ningún acompañante en una actividad. */
export function uncoveredForActivity(
  needs: NeedRow[],
  assignments: AssignmentRow[],
  activityId: string,
): number {
  return needs.filter(
    (n) => n.activity_id === activityId && confirmedFor(assignments, activityId, n.athlete_id) === 0,
  ).length
}

/** Barras de cupo (llenas/vacías) para la UI. */
export function slots(confirmed: number, required: number, strong: string) {
  const out: { fill: string; border: string }[] = []
  for (let i = 0; i < required; i++) {
    out.push({
      fill: i < confirmed ? strong : 'transparent',
      border: i < confirmed ? strong : 'var(--border-strong)',
    })
  }
  return out
}
