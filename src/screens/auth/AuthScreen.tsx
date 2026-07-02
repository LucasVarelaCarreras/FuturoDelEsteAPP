import { useState } from 'react'
import { z } from 'zod'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui'
import { TextField, FormError } from '@/components/fields'
import { Icon } from '@/components/Icon'

type View = 'welcome' | 'login' | 'register' | 'admin'

const ADMIN_CODE = (import.meta.env.VITE_ADMIN_TEAM_CODE as string | undefined) ?? 'FDE2026'

const emailSchema = z.string().trim().email('Ingresá un email válido.')

function friendlyError(message: string): string {
  const m = message.toLowerCase()
  if (m.includes('invalid login')) return 'Email o contraseña incorrectos.'
  if (m.includes('already registered') || m.includes('already been registered'))
    return 'Ya existe una cuenta con ese email. Iniciá sesión.'
  if (m.includes('email not confirmed')) return 'Confirmá tu email antes de ingresar (revisá tu correo).'
  if (m.includes('password')) return 'La contraseña debe tener al menos 6 caracteres.'
  return message
}

export function AuthScreen() {
  const [view, setView] = useState<View>('welcome')
  return (
    <div
      style={{
        minHeight: '100dvh',
        maxWidth: 'var(--app-max)',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--surface-page)',
      }}
    >
      <Hero />
      <div style={{ flex: 1, padding: '20px 22px calc(28px + var(--safe-bottom))' }}>
        {view === 'welcome' && <Welcome onView={setView} />}
        {view === 'login' && <LoginForm onView={setView} />}
        {view === 'register' && <RegisterForm onView={setView} />}
        {view === 'admin' && <AdminForm onView={setView} />}
      </div>
    </div>
  )
}

function Hero() {
  return (
    <div
      style={{
        background: 'var(--gradient-wave)',
        padding: 'calc(var(--safe-top) + 40px) 24px 34px',
        color: '#fff',
        textAlign: 'center',
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
      }}
    >
      <svg width="72" height="72" viewBox="0 0 100 100" style={{ margin: '0 auto 14px', display: 'block' }}>
        <rect width="100" height="100" rx="26" fill="rgba(255,255,255,0.16)" />
        <circle cx="50" cy="50" r="27" fill="#fff" />
        <g fill="none" stroke="#019AC4" strokeWidth="2.8" strokeLinecap="round">
          <path d="M30 44q5 -5 10 0t10 0t10 0" />
          <path d="M30 52q5 -5 10 0t10 0t10 0" />
          <path d="M30 60q5 -5 10 0t10 0t10 0" />
        </g>
      </svg>
      <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 26, color: '#fff', letterSpacing: '0.02em' }}>
        FUTURO DEL ESTE
      </h1>
      <p style={{ fontSize: 14, opacity: 0.95, marginTop: 6, fontWeight: 600 }}>
        Conectá atletas líder con atletas guía
      </p>
    </div>
  )
}

function Welcome({ onView }: { onView: (v: View) => void }) {
  const { signInWithGoogle } = useAuth()
  const [error, setError] = useState('')
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 12 }}>
      <h2 style={{ fontSize: 20, textAlign: 'center', marginBottom: 4 }}>Bienvenido/a</h2>
      <p style={{ fontSize: 14, color: 'var(--text-muted)', textAlign: 'center', marginBottom: 12 }}>
        Sumate como atleta guía y acompañá a quienes más lo necesitan.
      </p>
      <FormError>{error}</FormError>
      <Button full onClick={() => onView('register')}>
        Crear cuenta
      </Button>
      <Button full variant="secondary" onClick={() => onView('login')}>
        Ya tengo cuenta
      </Button>
      <button
        onClick={async () => {
          setError('')
          try {
            await signInWithGoogle()
          } catch (e) {
            setError('No se pudo iniciar con Google. Verificá que esté habilitado en Supabase.')
          }
        }}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 10,
          width: '100%',
          padding: 14,
          borderRadius: 'var(--radius-pill)',
          border: '1.5px solid var(--border-subtle)',
          background: '#fff',
          fontWeight: 800,
          fontSize: 15,
          color: 'var(--text-heading)',
        }}
      >
        <GoogleG /> Continuar con Google
      </button>
      <button
        onClick={() => onView('admin')}
        style={{ marginTop: 10, background: 'none', border: 'none', color: 'var(--text-muted)', fontWeight: 700, fontSize: 13.5 }}
      >
        Soy del equipo de la fundación
      </button>
    </div>
  )
}

function BackLink({ onView }: { onView: (v: View) => void }) {
  return (
    <button
      onClick={() => onView('welcome')}
      style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: 'none', color: 'var(--text-muted)', fontWeight: 700, fontSize: 14, marginBottom: 16 }}
    >
      <Icon glyph="back" size={18} color="var(--text-muted)" /> Volver
    </button>
  )
}

function LoginForm({ onView }: { onView: (v: View) => void }) {
  const { signInWithEmail } = useAuth()
  const [email, setEmail] = useState('')
  const [pass, setPass] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    const parsed = emailSchema.safeParse(email)
    if (!parsed.success) return setError(parsed.error.issues[0].message)
    if (!pass) return setError('Ingresá tu contraseña.')
    setLoading(true)
    try {
      await signInWithEmail(email, pass)
    } catch (err) {
      setError(friendlyError((err as Error).message))
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={submit}>
      <BackLink onView={onView} />
      <h2 style={{ fontSize: 22, marginBottom: 18 }}>Iniciar sesión</h2>
      <FormError>{error}</FormError>
      <TextField label="Email" id="email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="vos@email.com" />
      <TextField label="Contraseña" id="pass" type="password" autoComplete="current-password" value={pass} onChange={(e) => setPass(e.target.value)} placeholder="••••••••" />
      <Button full loading={loading} type="submit" style={{ marginTop: 6 }}>
        Ingresar
      </Button>
      <p style={{ textAlign: 'center', marginTop: 16, fontSize: 14, color: 'var(--text-muted)' }}>
        ¿No tenés cuenta?{' '}
        <button type="button" onClick={() => onView('register')} style={linkBtn}>
          Crear cuenta
        </button>
      </p>
    </form>
  )
}

function RegisterForm({ onView }: { onView: (v: View) => void }) {
  const { signUp } = useAuth()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [pass, setPass] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!name.trim()) return setError('Ingresá tu nombre.')
    const parsed = emailSchema.safeParse(email)
    if (!parsed.success) return setError(parsed.error.issues[0].message)
    if (pass.length < 6) return setError('La contraseña debe tener al menos 6 caracteres.')
    setLoading(true)
    try {
      await signUp(name, email, pass, 'guia')
      setDone(true)
    } catch (err) {
      setError(friendlyError((err as Error).message))
    } finally {
      setLoading(false)
    }
  }

  if (done) {
    return (
      <div style={{ textAlign: 'center', paddingTop: 20 }}>
        <div style={{ width: 64, height: 64, borderRadius: 20, background: 'var(--fde-emerald-50)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
          <Icon glyph="checkcircle" size={32} color="var(--fde-success)" />
        </div>
        <h2 style={{ fontSize: 20, marginBottom: 8 }}>¡Cuenta creada!</h2>
        <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 20 }}>
          Si tu proyecto requiere confirmación por email, revisá tu correo. Luego iniciá sesión.
        </p>
        <Button full onClick={() => onView('login')}>
          Ir a iniciar sesión
        </Button>
      </div>
    )
  }

  return (
    <form onSubmit={submit}>
      <BackLink onView={onView} />
      <h2 style={{ fontSize: 22, marginBottom: 18 }}>Crear cuenta</h2>
      <FormError>{error}</FormError>
      <TextField label="Nombre completo" id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Tu nombre y apellido" autoComplete="name" />
      <TextField label="Email" id="email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="vos@email.com" />
      <TextField label="Contraseña" id="pass" type="password" autoComplete="new-password" value={pass} onChange={(e) => setPass(e.target.value)} placeholder="Mínimo 6 caracteres" />
      <Button full loading={loading} type="submit" style={{ marginTop: 6 }}>
        Crear cuenta
      </Button>
      <p style={{ textAlign: 'center', marginTop: 16, fontSize: 14, color: 'var(--text-muted)' }}>
        ¿Ya tenés cuenta?{' '}
        <button type="button" onClick={() => onView('login')} style={linkBtn}>
          Iniciar sesión
        </button>
      </p>
    </form>
  )
}

function AdminForm({ onView }: { onView: (v: View) => void }) {
  const { signUp, signInWithEmail } = useAuth()
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [pass, setPass] = useState('')
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    const parsed = emailSchema.safeParse(email)
    if (!parsed.success) return setError(parsed.error.issues[0].message)
    setLoading(true)
    try {
      if (mode === 'login') {
        if (!pass) throw new Error('Ingresá tu contraseña.')
        await signInWithEmail(email, pass)
      } else {
        if (!name.trim()) throw new Error('Ingresá tu nombre.')
        if (pass.length < 6) throw new Error('La contraseña debe tener al menos 6 caracteres.')
        if (code.trim().toUpperCase() !== ADMIN_CODE.toUpperCase())
          throw new Error('Código de equipo incorrecto. Pedilo a la fundación.')
        await signUp(name, email, pass, 'admin')
        setError('')
        setMode('login')
        setLoading(false)
        return
      }
    } catch (err) {
      setError(friendlyError((err as Error).message))
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={submit}>
      <BackLink onView={onView} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <Icon glyph="shield" size={22} color="var(--fde-ocean)" />
        <h2 style={{ fontSize: 22 }}>Equipo de la fundación</h2>
      </div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 18, background: 'var(--surface-sunken)', borderRadius: 'var(--radius-pill)', padding: 4 }}>
        {(['login', 'register'] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => { setMode(m); setError('') }}
            style={{
              flex: 1,
              padding: '9px',
              borderRadius: 'var(--radius-pill)',
              border: 'none',
              fontWeight: 800,
              fontSize: 13.5,
              background: mode === m ? '#fff' : 'transparent',
              color: mode === m ? 'var(--text-heading)' : 'var(--text-muted)',
              boxShadow: mode === m ? 'var(--shadow-xs)' : 'none',
            }}
          >
            {m === 'login' ? 'Ingresar' : 'Registrarme'}
          </button>
        ))}
      </div>
      <FormError>{error}</FormError>
      {mode === 'register' && (
        <TextField label="Nombre completo" id="aname" value={name} onChange={(e) => setName(e.target.value)} placeholder="Tu nombre" autoComplete="name" />
      )}
      <TextField label="Email del equipo" id="aemail" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="equipo@futurodeleste.org" />
      <TextField label="Contraseña" id="apass" type="password" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} value={pass} onChange={(e) => setPass(e.target.value)} placeholder="••••••••" />
      {mode === 'register' && (
        <TextField label="Código de equipo" id="acode" value={code} onChange={(e) => setCode(e.target.value)} placeholder="Pedilo a la fundación" />
      )}
      <Button full loading={loading} type="submit" style={{ marginTop: 6 }}>
        {mode === 'login' ? 'Ingresar' : 'Crear cuenta de equipo'}
      </Button>
    </form>
  )
}

const linkBtn = {
  background: 'none',
  border: 'none',
  color: 'var(--color-primary-hover)',
  fontWeight: 800,
  fontSize: 14,
} as const

function GoogleG() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    </svg>
  )
}
