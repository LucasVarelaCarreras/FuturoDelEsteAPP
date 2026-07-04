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
import { queryClient } from '@/lib/queryClient'
import type { ProfileRow, UserRole } from '@/types/database'
import { initialsFrom } from '@/lib/format'

interface AuthContextValue {
  session: Session | null
  profile: ProfileRow | null
  role: UserRole | null
  loading: boolean
  /** true si hay sesión pero el perfil no se pudo cargar (p. ej. sin conexión). */
  profileError: boolean
  signInWithEmail: (email: string, password: string) => Promise<void>
  signInWithGoogle: () => Promise<void>
  signUp: (
    name: string,
    email: string,
    password: string,
    role: UserRole,
    adminCode?: string,
    phone?: string,
    category?: string,
  ) => Promise<void>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
  updatePassword: (password: string) => Promise<void>
  passwordRecovery: boolean
  /** Mensaje si el enlace de email (recuperación/confirmación) vino con error (p. ej. expirado). */
  authLinkError: string | null
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

/**
 * Si el usuario llega desde un enlace de email inválido o vencido, Supabase
 * redirige con el error en la URL (#error_code=otp_expired&...). Sin esto,
 * la persona aterrizaba en la pantalla de login sin ninguna explicación.
 * Se lee una sola vez al iniciar y se limpia la URL.
 */
function readAuthLinkError(): string | null {
  const hash = window.location.hash.replace(/^#/, '')
  const params = new URLSearchParams(hash.includes('=') ? hash : '')
  const query = new URLSearchParams(window.location.search)
  const code = params.get('error_code') ?? query.get('error_code')
  const error = params.get('error') ?? query.get('error')
  if (!code && !error) return null
  window.history.replaceState(null, '', window.location.pathname)
  if (code === 'otp_expired')
    return 'El enlace del email ya expiró o ya fue usado. Pedí uno nuevo desde “¿Olvidaste tu contraseña?”.'
  return 'No pudimos validar el enlace del email. Pedí uno nuevo e intentá otra vez.'
}

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
  const [profileError, setProfileError] = useState(false)
  const [passwordRecovery, setPasswordRecovery] = useState(false)
  const [authLinkError, setAuthLinkError] = useState<string | null>(null)
  const mounted = useRef(true)
  // Espejo del perfil vigente para decidir dentro de loadProfile sin
  // depender de un closure viejo (ver comentario de abajo).
  const profileRef = useRef<ProfileRow | null>(null)

  const setProfileSafe = useCallback((p: ProfileRow | null) => {
    profileRef.current = p
    setProfile(p)
  }, [])

  const loadProfile = useCallback(
    async (userId: string | undefined) => {
      if (!userId) {
        setProfileSafe(null)
        setProfileError(false)
        return
      }
      // El trigger de la base crea el perfil; reintentamos por si hay latencia.
      let p = await fetchProfile(userId)
      if (!p) {
        await new Promise((r) => setTimeout(r, 600))
        p = await fetchProfile(userId)
      }
      if (mounted.current) {
        // loadProfile también corre en eventos posteriores al login
        // (TOKEN_REFRESHED / SIGNED_IN al volver a la pestaña). Si esa
        // recarga falla por un corte breve de red pero YA teníamos el
        // perfil de este mismo usuario, lo conservamos: pisarlo con null
        // sacaba a la persona de su pantalla y la dejaba en el error de
        // cuenta ("No pudimos cargar tu cuenta") sin motivo real.
        const prev = profileRef.current
        const next = !p && prev && prev.id === userId ? prev : p
        setProfileSafe(next)
        // Si con sesión válida el perfil sigue sin aparecer (falla de red o
        // fila faltante), lo marcamos: la app ofrece reintentar o cerrar
        // sesión en vez de quedarse en un cargador infinito.
        setProfileError(next === null)
      }
    },
    [setProfileSafe],
  )

  useEffect(() => {
    mounted.current = true
    setAuthLinkError(readAuthLinkError())

    supabase.auth.getSession().then(async ({ data }) => {
      if (!mounted.current) return
      setSession(data.session)
      await loadProfile(data.session?.user.id)
      if (mounted.current) setLoading(false)
    })

    const { data: sub } = supabase.auth.onAuthStateChange((event, newSession) => {
      if (!mounted.current) return
      if (event === 'PASSWORD_RECOVERY') setPasswordRecovery(true)
      setSession(newSession)
      // IMPORTANTE: no usar `await` de llamadas a supabase-js dentro de este
      // callback. Corre con el lock interno de auth tomado y esperar otra
      // llamada de la librería puede producir un deadlock (login que queda
      // colgado en "Iniciando…"). Por eso la carga del perfil se difiere.
      setTimeout(() => {
        if (!mounted.current) return
        loadProfile(newSession?.user.id).finally(() => {
          if (mounted.current) setLoading(false)
        })
      }, 0)
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
    async (
      name: string,
      email: string,
      password: string,
      role: UserRole,
      adminCode?: string,
      phone?: string,
      category?: string,
    ) => {
      const data: Record<string, string> = {
        full_name: name.trim(),
        initials: initialsFrom(name),
        role,
      }
      // Teléfono y categoría del Atleta Guía: el trigger handle_new_user
      // (migración 0005) los copia del metadata al perfil.
      if (phone?.trim()) data.phone = phone.trim()
      if (category?.trim()) data.category = category.trim()
      if (role === 'admin' && adminCode) data.admin_code = adminCode
      const { data: result, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: { data, emailRedirectTo: window.location.origin },
      })
      if (error) throw error
      // Supabase, por seguridad, no informa si un email ya está registrado:
      // responde "éxito" pero con identities=[] y sin crear nada nuevo.
      // Lo detectamos para avisarle claramente al usuario en vez de dejarlo
      // creer que la cuenta se creó cuando en realidad no pasó nada.
      if (result.user && result.user.identities && result.user.identities.length === 0) {
        throw new Error('User already registered')
      }
    },
    [],
  )

  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
    setProfileSafe(null)
    setProfileError(false)
    setSession(null)
    // Limpia el caché de datos: evita que la próxima sesión en el mismo
    // dispositivo vea (aunque sea por segundos) datos del usuario anterior.
    queryClient.clear()
  }, [setProfileSafe])

  const refreshProfile = useCallback(async () => {
    if (session?.user.id) await loadProfile(session.user.id)
  }, [session, loadProfile])

  const resetPassword = useCallback(async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: window.location.origin,
    })
    if (error) throw error
  }, [])

  const updatePassword = useCallback(async (password: string) => {
    const { error } = await supabase.auth.updateUser({ password })
    if (error) throw error
    setPasswordRecovery(false)
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      profile,
      role: profile?.role ?? null,
      loading,
      profileError,
      signInWithEmail,
      signInWithGoogle,
      signUp,
      signOut,
      refreshProfile,
      resetPassword,
      updatePassword,
      passwordRecovery,
      authLinkError,
    }),
    [
      session,
      profile,
      loading,
      profileError,
      signInWithEmail,
      signInWithGoogle,
      signUp,
      signOut,
      refreshProfile,
      resetPassword,
      updatePassword,
      passwordRecovery,
      authLinkError,
    ],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>')
  return ctx
}
