export function ConfigNeeded() {
  return (
    <div
      style={{
        minHeight: '100dvh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        background: 'var(--gradient-wave-soft)',
      }}
    >
      <div
        style={{
          maxWidth: 420,
          background: 'var(--surface-card)',
          borderRadius: 'var(--radius-lg)',
          padding: 28,
          boxShadow: 'var(--shadow-md)',
        }}
      >
        <h1 style={{ fontSize: 20, marginBottom: 12 }}>Configuración pendiente</h1>
        <p style={{ fontSize: 14, lineHeight: 1.6, marginBottom: 14 }}>
          La aplicación necesita conectarse a Supabase. Copiá el archivo{' '}
          <code style={{ background: 'var(--surface-sunken)', padding: '2px 6px', borderRadius: 6 }}>
            .env.example
          </code>{' '}
          a{' '}
          <code style={{ background: 'var(--surface-sunken)', padding: '2px 6px', borderRadius: 6 }}>
            .env
          </code>{' '}
          y completá:
        </p>
        <ul style={{ fontSize: 13.5, lineHeight: 1.9, paddingLeft: 18, color: 'var(--text-body)' }}>
          <li>
            <code>VITE_SUPABASE_URL</code>
          </li>
          <li>
            <code>VITE_SUPABASE_ANON_KEY</code>
          </li>
        </ul>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 14 }}>
          Encontrá estos valores en tu proyecto de Supabase → Project Settings → API. Ejecutá la
          migración de <code>supabase/migrations</code> para crear las tablas.
        </p>
      </div>
    </div>
  )
}
