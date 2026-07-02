import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { qk } from '@/lib/queryClient'
import type {
  ActivityRow,
  ActivityType,
  AssignmentRow,
  AthleteRow,
  NeedRow,
  ProfileRow,
} from '@/types/database'
import { initialsFrom } from '@/lib/format'
import { computeTermsHash, TERMS_VERSION } from '@/lib/terms'

/* ============================================================
   QUERIES
   ============================================================ */
export function useAthletes() {
  return useQuery({
    queryKey: qk.athletes,
    queryFn: async (): Promise<AthleteRow[]> => {
      const { data, error } = await supabase.from('athletes').select('*').order('name')
      if (error) throw error
      return data ?? []
    },
  })
}

export function useActivities() {
  return useQuery({
    queryKey: qk.activities,
    queryFn: async (): Promise<ActivityRow[]> => {
      const { data, error } = await supabase
        .from('activities')
        .select('*')
        .order('date', { ascending: true, nullsFirst: false })
      if (error) throw error
      return data ?? []
    },
  })
}

export function useNeeds() {
  return useQuery({
    queryKey: qk.needs,
    queryFn: async (): Promise<NeedRow[]> => {
      const { data, error } = await supabase.from('needs').select('*')
      if (error) throw error
      return data ?? []
    },
  })
}

export function useAssignments() {
  return useQuery({
    queryKey: qk.assignments,
    queryFn: async (): Promise<AssignmentRow[]> => {
      const { data, error } = await supabase.from('assignments').select('*')
      if (error) throw error
      return data ?? []
    },
  })
}

/** Perfiles con rol de guía (para que el admin sume acompañantes). */
export function useGuides(enabled = true) {
  return useQuery({
    queryKey: qk.guides,
    enabled,
    queryFn: async (): Promise<ProfileRow[]> => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'guia')
        .order('full_name')
      if (error) throw error
      return data ?? []
    },
  })
}

/* ============================================================
   MUTATIONS — ATLETAS
   ============================================================ */
export interface AthleteInput {
  name: string
  sport?: string
  category?: string
  gender?: string
}

export function useSaveAthlete() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, input }: { id?: string; input: AthleteInput }) => {
      const patch = {
        name: input.name.trim(),
        initials: initialsFrom(input.name),
        sport: input.sport?.trim() || 'Atletismo',
        category: input.category?.trim() ?? '',
        gender: input.gender ?? '',
      }
      if (id) {
        const { error } = await supabase.from('athletes').update(patch).eq('id', id)
        if (error) throw error
      } else {
        const { error } = await supabase.from('athletes').insert(patch)
        if (error) throw error
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.athletes }),
  })
}

export function useToggleAthleteActive() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, active }: { id: string; active: boolean }) => {
      const { error } = await supabase.from('athletes').update({ active }).eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.athletes }),
  })
}

export function useDeleteAthlete() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('athletes').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.athletes })
      qc.invalidateQueries({ queryKey: qk.needs })
      qc.invalidateQueries({ queryKey: qk.assignments })
    },
  })
}

/* ============================================================
   MUTATIONS — ACTIVIDADES
   ============================================================ */
export interface ActivityInput {
  name: string
  type: ActivityType
  date?: string
  time?: string
  place?: string
  description?: string
}

export function useSaveActivity() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, input }: { id?: string; input: ActivityInput }) => {
      const patch = {
        name: input.name.trim(),
        type: input.type,
        date: input.date || null,
        time: input.time?.trim() ?? '',
        place: input.place?.trim() ?? '',
        description: input.description?.trim() ?? '',
      }
      if (id) {
        const { error } = await supabase.from('activities').update(patch).eq('id', id)
        if (error) throw error
      } else {
        const { error } = await supabase.from('activities').insert(patch)
        if (error) throw error
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.activities }),
  })
}

export function useToggleActivityVisible() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, visible }: { id: string; visible: boolean }) => {
      const { error } = await supabase.from('activities').update({ visible }).eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.activities }),
  })
}

export function useDeleteActivity() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('activities').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.activities })
      qc.invalidateQueries({ queryKey: qk.needs })
      qc.invalidateQueries({ queryKey: qk.assignments })
    },
  })
}

/* ============================================================
   MUTATIONS — NEEDS (inscripción de atleta en actividad)
   ============================================================ */
export function useAddNeed() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ activityId, athleteId }: { activityId: string; athleteId: string }) => {
      const { error } = await supabase
        .from('needs')
        .insert({ activity_id: activityId, athlete_id: athleteId, required: 1 })
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.needs }),
  })
}

export function useRemoveNeed() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (need: NeedRow) => {
      const { error: e1 } = await supabase
        .from('assignments')
        .delete()
        .eq('activity_id', need.activity_id)
        .eq('athlete_id', need.athlete_id)
      if (e1) throw e1
      const { error } = await supabase.from('needs').delete().eq('id', need.id)
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.needs })
      qc.invalidateQueries({ queryKey: qk.assignments })
    },
  })
}

export function useSetRequired() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, required }: { id: string; required: number }) => {
      const { error } = await supabase
        .from('needs')
        .update({ required: Math.max(1, required) })
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.needs }),
  })
}

/* ============================================================
   MUTATIONS — ASSIGNMENTS (acompañamientos)
   ============================================================ */
export function useSignUp() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({
      activityId,
      athleteId,
      guideId,
      guideName,
    }: {
      activityId: string
      athleteId: string
      guideId: string
      guideName: string
    }) => {
      const { error } = await supabase.from('assignments').insert({
        activity_id: activityId,
        athlete_id: athleteId,
        guide_id: guideId,
        guide_name: guideName,
      })
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.assignments }),
  })
}

export function useCancelAssignment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('assignments').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.assignments }),
  })
}

/** Admin suma un acompañante (guía registrado) a un atleta en una actividad. */
export function useAddGuideAssignment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({
      activityId,
      athleteId,
      guide,
    }: {
      activityId: string
      athleteId: string
      guide: ProfileRow
    }) => {
      const { error } = await supabase.from('assignments').insert({
        activity_id: activityId,
        athlete_id: athleteId,
        guide_id: guide.id,
        guide_name: guide.full_name,
      })
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.assignments }),
  })
}

export function useRemoveGuideAssignment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('assignments').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.assignments }),
  })
}

/* ============================================================
   MUTATIONS — TÉRMINOS Y CONDICIONES
   ============================================================ */
export function useAcceptTerms() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (userId: string) => {
      const hash = await computeTermsHash()
      let ip = ''
      try {
        const res = await fetch('https://api.ipify.org?format=json')
        ip = (await res.json()).ip ?? ''
      } catch {
        ip = ''
      }
      const { error } = await supabase.from('tc_acceptances').insert({
        user_id: userId,
        doc_version: TERMS_VERSION,
        doc_hash: hash,
        ip,
        user_agent: navigator.userAgent.slice(0, 400),
      })
      if (error) throw error
    },
    onSuccess: (_data, userId) => qc.invalidateQueries({ queryKey: qk.tc(userId) }),
  })
}

/** Última aceptación de T&C de un usuario (para el panel admin y el gate). */
export function useLatestTermsAcceptance(userId: string | undefined, enabled = true) {
  return useQuery({
    queryKey: qk.tc(userId ?? 'none'),
    enabled: Boolean(userId) && enabled,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tc_acceptances')
        .select('*')
        .eq('user_id', userId!)
        .order('accepted_at', { ascending: false })
        .limit(1)
        .maybeSingle()
      if (error) throw error
      return data
    },
  })
}
