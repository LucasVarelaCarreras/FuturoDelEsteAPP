/**
 * Tipos de la base de datos (Supabase / PostgreSQL).
 * Mantener sincronizado con supabase/migrations.
 */
export type UserRole = 'guia' | 'admin'
export type ActivityType = 'carrera' | 'entrenamiento' | 'evento'

export type ProfileRow = {
  id: string
  full_name: string
  email: string
  initials: string
  role: UserRole
  /** Marcado como favorito por el admin (sólo un admin puede cambiarlo). */
  favorite: boolean
  created_at: string
  updated_at: string
}

export type AthleteRow = {
  id: string
  name: string
  initials: string
  color: string
  sport: string
  category: string
  gender: string
  active: boolean
  /** Marcado como favorito por el admin. */
  favorite: boolean
  created_by: string | null
  created_at: string
  updated_at: string
}

export type ActivityRow = {
  id: string
  name: string
  type: ActivityType
  date: string | null
  time: string
  place: string
  description: string
  visible: boolean
  created_by: string | null
  created_at: string
  updated_at: string
}

export type NeedRow = {
  id: string
  activity_id: string
  athlete_id: string
  required: number
  note: string
  created_at: string
}

export type AssignmentRow = {
  id: string
  activity_id: string
  athlete_id: string
  guide_id: string | null
  guide_name: string
  created_at: string
}

/**
 * Favorito del admin en la sección Atletas. Apunta a exactamente UNO:
 * un Atleta Líder (athlete_id) o un Atleta Guía (guide_id).
 */
export type FavoriteRow = {
  id: string
  user_id: string
  athlete_id: string | null
  guide_id: string | null
  created_at: string
}

export type TcAcceptanceRow = {
  id: string
  user_id: string
  accepted_at: string
  doc_version: string
  doc_hash: string
  ip: string
  user_agent: string
}

export type SettingRow = {
  key: string
  value: Record<string, unknown>
  updated_at: string
}

interface Table<T> {
  Row: T
  Insert: Partial<T>
  Update: Partial<T>
  Relationships: []
}

export interface Database {
  public: {
    Tables: {
      profiles: Table<ProfileRow>
      athletes: Table<AthleteRow>
      activities: Table<ActivityRow>
      needs: Table<NeedRow>
      assignments: Table<AssignmentRow>
      athlete_favorites: Table<FavoriteRow>
      tc_acceptances: Table<TcAcceptanceRow>
      settings: Table<SettingRow>
    }
    Views: Record<string, never>
    Functions: {
      is_admin: { Args: Record<string, never>; Returns: boolean }
    }
    Enums: {
      user_role: UserRole
      activity_type: ActivityType
    }
    CompositeTypes: Record<string, never>
  }
}
