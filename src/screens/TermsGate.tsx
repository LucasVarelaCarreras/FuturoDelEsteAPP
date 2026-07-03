import { useState, type ReactNode } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useAcceptTerms, useLatestTermsAcceptance } from '@/hooks/data'
import { LEGAL_DOCS, TERMS_SUMMARY, TERMS_TITLE, TERMS_VERSION } from '@/lib/terms'
import { Button, FullScreenLoader } from '@/components/ui'
import { Icon } from '@/components/Icon'

/**
 * Exige que el atleta guía acepte la versión vigente de los documentos
 * legales. Se muestra si nunca aceptó o si la versión cambió (trazabilidad).
 * Diseño tipo diálogo compacto: resumen breve + links a los documentos
 * completos (PDF reales) + checkbox obligatorio antes de poder aceptar.
 */
export function TermsGate({ children }: { children: ReactNode }) {
  const { profile, signOut } = useAuth()
  const { data: latest, isLoading } = useLatestTermsAcceptance(profile?.id)
  const accept = useAcceptTerms()
  const [checked, setChecked] = useState(false)
  const [error, setError] = useState('')

  if (isLoading) return <FullScreenLoader label="Cargando…" />

  const accepted = latest && latest.doc_version === TERMS_VERSION
  if (accepted) return <>{children}</>

  const onAccept = async () => {
    if (!profile || !checked) return
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
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--gradient-wave-soft)',
        padding: '24px 18px',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 400,
          background: 'var(--surface-card)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-md)',
          padding: '28px 24px 22px',
        }}
      >
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: '50%',
            background: 'var(--fde-cyan-50)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
          }}
        >
          <Icon glyph="shield" size={28} color="var(--fde-cyan)" />
        </div>

        <h1 style={{ fontSize: 19, fontWeight: 800, textAlign: 'center', marginBottom: 6 }}>{TERMS_TITLE}</h1>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'center', marginBottom: 18, lineHeight: 1.5 }}>
          Antes de acompañar atletas, necesitamos que confirmes lo siguiente:
        </p>

        <ul style={{ margin: '0 0 16px', padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {TERMS_SUMMARY.map((line, i) => (
            <li key={i} style={{ display: 'flex', gap: 9, fontSize: 13, color: 'var(--text-body)', lineHeight: 1.5 }}>
              <span
                aria-hidden="true"
                style={{ flex: '0 0 6px', width: 6, height: 6, borderRadius: '50%', background: 'var(--fde-cyan)', marginTop: 6 }}
              />
              {line}
            </li>
          ))}
        </ul>

        <p style={{ fontSize: 12.5, color: 'var(--text-muted)', marginBottom: 8, fontWeight: 700 }}>
          Documentos completos:
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 18 }}>
          {LEGAL_DOCS.map((doc) => (
            <a
              key={doc.key}
              href={doc.file}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                fontSize: 13.5,
                fontWeight: 700,
                color: 'var(--color-primary-hover)',
              }}
            >
              <Icon glyph="inbox" size={15} color="var(--color-primary-hover)" />
              {doc.label}
            </a>
          ))}
        </div>

        {error && (
          <p role="alert" style={{ color: '#c0392b', fontSize: 13, fontWeight: 700, marginBottom: 10 }}>
            {error}
          </p>
        )}

        <label
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: 10,
            fontSize: 13,
            color: 'var(--text-body)',
            lineHeight: 1.5,
            marginBottom: 18,
            cursor: 'pointer',
          }}
        >
          <input
            type="checkbox"
            checked={checked}
            onChange={(e) => setChecked(e.target.checked)}
            style={{ marginTop: 2, width: 18, height: 18, flex: '0 0 18px', accentColor: 'var(--color-primary)' }}
          />
          He leído y acepto el Deslinde de responsabilidad y la Cesión de derechos de imagen.
        </label>

        <Button full onClick={onAccept} loading={accept.isPending} disabled={!checked}>
          Aceptar y continuar
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
