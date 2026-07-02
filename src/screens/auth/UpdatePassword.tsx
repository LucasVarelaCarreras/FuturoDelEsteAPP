import { useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui'
import { TextField, FormError } from '@/components/fields'

/** Pantalla de cambio de contraseña tras seguir el enlace de recuperación. */
export function UpdatePassword() {
  const { updatePassword, signOut } = useAuth()
  const [pass, setPass] = useState('')
  const [pass2, setPass2] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (pass.length < 6) return setError('La contraseña debe tener al menos 6 caracteres.')
    if (pass !== pass2) return setError('Las contraseñas no coinciden.')
    setLoading(true)
    try {
      await updatePassword(pass)
      setDone(true)
    } catch {
      setError('No se pudo actualizar la contraseña. Volvé a solicitar el enlace.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        minHeight: '100dvh',
        maxWidth: 'var(--app-max)',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '24px 22px',
        background: 'var(--surface-page)',
      }}
    >
      <h1 style={{ fontSize: 22, marginBottom: 8 }}>Nueva contraseña</h1>
      {done ? (
        <>
          <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 20 }}>
            Tu contraseña se actualizó correctamente.
          </p>
          <Button full onClick={() => signOut()}>
            Ir a iniciar sesión
          </Button>
        </>
      ) : (
        <form onSubmit={submit}>
          <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 18 }}>
            Elegí una contraseña nueva para tu cuenta.
          </p>
          <FormError>{error}</FormError>
          <TextField
            label="Nueva contraseña"
            id="np"
            type="password"
            autoComplete="new-password"
            value={pass}
            onChange={(e) => setPass(e.target.value)}
            placeholder="Mínimo 6 caracteres"
          />
          <TextField
            label="Repetir contraseña"
            id="np2"
            type="password"
            autoComplete="new-password"
            value={pass2}
            onChange={(e) => setPass2(e.target.value)}
            placeholder="Repetí la contraseña"
          />
          <Button full loading={loading} type="submit" style={{ marginTop: 6 }}>
            Guardar contraseña
          </Button>
        </form>
      )}
    </div>
  )
}
