import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import type { ProfileRow, UserRole } from '@/types/database'
import { initialsFrom } from '@/lib/format'

interface AuthContextValue {
  session: Session | null
  profile: ProfileRow | null
  role: UserRole | null
  loading: boolean
  signInWithEmail: (email: string, password: string) => Promise<void>
  signInWithGoogle: () => Promise<void>
  signUp: (name: string, email: string, password: string, role: UserRole) => Promise<void>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

async function fetchProfile(userId: string): Promise<ProfileRow | null> {
  const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle()
  if (error) {
    console.error('[auth] error al leer perfil', error)
    return null
  }
  return data
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<ProfileRow | null>(null)
  const [loading, setLoading] = useState(true)
  const mounted = useRef(true)

  const loadProfile = useCallback(async (userId: string | undefined) => {
    if (!userId) {
      setProfile(null)
      return
    }
    // El trigger de la base crea el perfil; reintentamos por si hay latencia.
    let p = await fetchProfile(userId)
    if (!p) {
      await new Promise((r) => setTimeout(r, 600))
      p = await fetchProfile(userId)
    }
    if (mounted.current) setProfile(p)
  }, [])

  useEffect(() => {
    mounted.current = true

    supabase.auth.getSession().then(async ({ data }) => {
      if (!mounted.current) return
      setSession(data.session)
      await loadProfile(data.session?.user.id)
      if (mounted.current) setLoading(false)
    })

    const { data: sub } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      if (!mounted.current) return
      setSession(newSession)
      await loadProfile(newSession?.user.id)
      if (mounted.current) setLoading(false)
    })

    return () => {
      mounted.current = false
      sub.subscription.unsubscribe()
    }
  }, [loadProfile])

  const signInWithEmail = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
    if (error) throw error
  }, [])

  const signInWithGoogle = useCallback(async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    })
    if (error) throw error
  }, [])

  const signUp = useCallback(
    async (name: string, email: string, password: string, role: UserRole) => {
      const { error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: { full_name: name.trim(), initials: initialsFrom(name), role },
          emailRedirectTo: window.location.origin,
        },
      })
      if (error) throw error
    },
    [],
  )

  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
    setProfile(null)
    setSession(null)
  }, [])

  const refreshProfile = useCallback(async () => {
    if (session?.user.id) await loadProfile(session.user.id)
  }, [session, loadProfile])

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      profile,
      role: profile?.role ?? null,
      loading,
      signInWithEmail,
      signInWithGoogle,
      signUp,
      signOut,
      refreshProfile,
    }),
    [session, profile, loading, signInWithEmail, signInWithGoogle, signUp, signOut, refreshProfile],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>')
  return ctx
}
