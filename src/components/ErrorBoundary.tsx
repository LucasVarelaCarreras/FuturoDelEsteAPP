import { Component, type ErrorInfo, type ReactNode } from 'react'

interface Props {
  children: ReactNode
}
interface State {
  hasError: boolean
}

/** Captura errores de render para no dejar la app en blanco. */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary]', error, info)
  }

  render() {
    if (!this.state.hasError) return this.props.children
    return (
      <div
        style={{
          minHeight: '100dvh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          padding: 24,
          gap: 12,
          background: 'var(--surface-page)',
        }}
      >
        <h1 style={{ fontSize: 20 }}>Algo salió mal</h1>
        <p style={{ fontSize: 14, color: 'var(--text-muted)', maxWidth: 320 }}>
          Ocurrió un error inesperado. Recargá la aplicación para continuar.
        </p>
        <button
          onClick={() => window.location.reload()}
          style={{
            marginTop: 8,
            padding: '13px 24px',
            borderRadius: 'var(--radius-pill)',
            border: 'none',
            background: 'var(--color-primary)',
            color: '#fff',
            fontWeight: 800,
            fontSize: 15,
            boxShadow: 'var(--shadow-brand)',
          }}
        >
          Recargar
        </button>
      </div>
    )
  }
}
