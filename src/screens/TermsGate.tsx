import { useState, type ReactNode } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useAcceptTerms, useLatestTermsAcceptance } from '@/hooks/data'
import { TERMS_TEXT, TERMS_TITLE, TERMS_VERSION } from '@/lib/terms'
import { Button, FullScreenLoader } from '@/components/ui'
import { Icon } from '@/components/Icon'

/**
 * Exige que el atleta guía acepte la versión vigente de los T&C.
 * Se muestra si nunca aceptó o si la versión cambió (trazabilidad legal).
 */
export function TermsGate({ children }: { children: ReactNode }) {
  const { profile, signOut } = useAuth()
  const { data: latest, isLoading } = useLatestTermsAcceptance(profile?.id)
  const accept = useAcceptTerms()
  const [error, setError] = useState('')

  if (isLoading) return <FullScreenLoader label="Cargando…" />

  const accepted = latest && latest.doc_version === TERMS_VERSION
  if (accepted) return <>{children}</>

  const onAccept = async () => {
    if (!profile) return
    setError('')
    try {
      await accept.mutateAsync(profile.id)
    } catch {
      setError('No pudimos registrar tu aceptación. Intentá de nuevo.')
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
        background: 'var(--surface-page)',
        paddingTop: 'var(--safe-top)',
      }}
    >
      <div style={{ padding: '24px 20px 12px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <div
          style={{
            width: 46,
            height: 46,
            borderRadius: 14,
            background: 'var(--gradient-wave)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon glyph="shield" size={24} color="#fff" />
        </div>
        <div>
          <h1 style={{ fontSize: 19, fontWeight: 800 }}>{TERMS_TITLE}</h1>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 700 }}>Versión {TERMS_VERSION}</p>
        </div>
      </div>

      <div
        className="no-scrollbar"
        style={{
          flex: 1,
          overflowY: 'auto',
          margin: '0 20px',
          padding: 18,
          background: 'var(--surface-card)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          fontSize: 13.5,
          lineHeight: 1.7,
          color: 'var(--text-body)',
          whiteSpace: 'pre-wrap',
        }}
      >
        {TERMS_TEXT}
      </div>

      <div style={{ padding: '16px 20px calc(20px + var(--safe-bottom))' }}>
        {error && (
          <p role="alert" style={{ color: '#c0392b', fontSize: 13, fontWeight: 700, marginBottom: 10 }}>
            {error}
          </p>
        )}
        <Button full onClick={onAccept} loading={accept.isPending}>
          Acepto los Términos y Condiciones
        </Button>
        <button
          onClick={() => signOut()}
          style={{
            width: '100%',
            marginTop: 10,
            background: 'none',
            border: 'none',
            color: 'var(--text-muted)',
            fontWeight: 700,
            fontSize: 13.5,
            padding: 8,
          }}
        >
          Cerrar sesión
        </button>
      </div>
    </div>
  )
}
