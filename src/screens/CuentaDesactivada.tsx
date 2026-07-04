import { useAuth } from '@/context/AuthContext'
import { Icon } from '@/components/Icon'

/**
 * Pantalla de bloqueo para un Atleta Guía con la cuenta desactivada por
 * la coordinación (profiles.active = false). Calcada de la demo v2.2:
 * ícono de alerta, título, textos y botón de cerrar sesión. Se muestra
 * en lugar de la app (App.tsx, antes del gate de T&C); el servidor
 * además rechaza cualquier inscripción por API (migración 0005).
 */
export function CuentaDesactivada() {
  const { signOut } = useAuth()

  return (
    <div
      style={{
        minHeight: '100dvh',
        maxWidth: 'var(--app-max)',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '48px 30px',
        background: 'var(--surface-page)',
      }}
    >
      <div
        style={{
          width: 86,
          height: 86,
          borderRadius: '50%',
          background: '#FDECEA',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 22,
        }}
      >
        <Icon glyph="alert" size={40} color="var(--fde-danger)" />
      </div>
      <h1 style={{ margin: '0 0 12px', fontSize: 23, fontWeight: 800, color: 'var(--text-heading)', letterSpacing: '-0.01em' }}>
        Cuenta desactivada
      </h1>
      <p style={{ margin: 0, fontSize: 14.5, color: 'var(--text-body)', lineHeight: 1.6, maxWidth: 300 }}>
        Tu cuenta de acompañante fue desactivada por la coordinación de la fundación. No podés anotarte
        en actividades ni acceder a la aplicación.
      </p>
      <p style={{ margin: '14px 0 0', fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.55, maxWidth: 300 }}>
        Si creés que es un error, comunicate con el equipo de Futuro del Este.
      </p>
      <button
        onClick={() => signOut()}
        style={{
          marginTop: 30,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          background: 'var(--fde-navy)',
          border: 'none',
          color: '#fff',
          fontFamily: 'var(--font-sans)',
          fontWeight: 800,
          fontSize: 15,
          padding: '14px 28px',
          borderRadius: 'var(--radius-pill)',
          cursor: 'pointer',
        }}
      >
        Cerrar sesión
      </button>
    </div>
  )
}
