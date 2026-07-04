import { useLatestTermsAcceptance } from '@/hooks/data'
import { Spinner } from '@/components/ui'
import type { ProfileRow } from '@/types/database'

/**
 * Última aceptación de T&C de un Atleta Guía (auditoría legal).
 * Se muestra dentro de una hoja (Sheet) en Ajustes y en la pestaña
 * "Atletas Guía" de la sección Atletas del admin.
 */
export function TcDetail({ guide }: { guide: ProfileRow }) {
  const { data, isLoading } = useLatestTermsAcceptance(guide.id)

  if (isLoading) {
    return (
      <div style={{ padding: 24, display: 'flex', justifyContent: 'center' }}>
        <Spinner />
      </div>
    )
  }

  if (!data) {
    return (
      <p style={{ fontSize: 13.5, color: 'var(--text-muted)', padding: '8px 0 20px' }}>
        {guide.full_name} todavía no aceptó los Términos y Condiciones.
      </p>
    )
  }

  const rows: [string, string][] = [
    ['Usuario', guide.full_name],
    ['ID de usuario', data.user_id],
    ['Fecha y hora', new Date(data.accepted_at).toLocaleString('es-UY')],
    ['Versión del documento', data.doc_version || '—'],
    ['Dirección IP', data.ip || '—'],
    ['Dispositivo / navegador', data.user_agent || '—'],
    ['Hash del documento', data.doc_hash || '—'],
  ]

  return (
    <div style={{ paddingBottom: 12 }}>
      {rows.map(([label, value]) => (
        <div key={label} style={{ padding: '10px 0', borderBottom: '1px solid var(--border-subtle)' }}>
          <div style={{ fontSize: 11.5, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.03em', marginBottom: 3 }}>{label}</div>
          <div style={{ fontSize: 13.5, color: 'var(--text-heading)', fontWeight: 600, wordBreak: 'break-all' }}>{value}</div>
        </div>
      ))}
    </div>
  )
}
