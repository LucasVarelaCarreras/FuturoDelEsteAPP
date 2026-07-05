import { useState, type ButtonHTMLAttributes, type CSSProperties, type ReactNode } from 'react'
import { Icon } from './Icon'

/* ---- Spinner ---- */
export function Spinner({ size = 22, color = 'var(--color-primary)' }: { size?: number; color?: string }) {
  return (
    <span
      aria-hidden="true"
      style={{
        display: 'inline-block',
        width: size,
        height: size,
        border: `${Math.max(2, size / 10)}px solid var(--fde-mist)`,
        borderTopColor: color,
        borderRadius: '50%',
        animation: 'fde-spin 0.7s linear infinite',
      }}
    />
  )
}

/* ---- Pantalla de carga a página completa ---- */
export function FullScreenLoader({ label = 'Cargando…' }: { label?: string }) {
  return (
    <div
      style={{
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
        background: 'var(--surface-page)',
      }}
    >
      <Spinner size={34} />
      <span style={{ color: 'var(--text-muted)', fontWeight: 700, fontSize: 14 }}>{label}</span>
    </div>
  )
}

/* ---- Avatar: foto de perfil (si hay `src`) o círculo de iniciales ---- */
export function Avatar({
  initials,
  color = 'var(--fde-cyan)',
  size = 42,
  src,
}: {
  initials: string
  color?: string
  size?: number
  /** Foto de perfil (p. ej. de Google). Si falta o falla al cargar, se cae a las iniciales. */
  src?: string | null
}) {
  const [imgFailed, setImgFailed] = useState(false)

  if (src && !imgFailed) {
    return (
      <img
        src={src}
        alt=""
        aria-hidden="true"
        onError={() => setImgFailed(true)}
        style={{
          width: size,
          height: size,
          flex: `0 0 ${size}px`,
          borderRadius: '50%',
          objectFit: 'cover',
        }}
      />
    )
  }

  return (
    <div
      aria-hidden="true"
      style={{
        width: size,
        height: size,
        flex: `0 0 ${size}px`,
        borderRadius: '50%',
        background: color,
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 800,
        fontSize: size * 0.38,
        letterSpacing: '0.02em',
      }}
    >
      {initials}
    </div>
  )
}

/* ---- Botón ---- */
type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  full?: boolean
  loading?: boolean
  children: ReactNode
}

const VARIANT_STYLES: Record<Variant, CSSProperties> = {
  primary: { background: 'var(--color-primary)', color: '#fff', boxShadow: 'var(--shadow-brand)' },
  secondary: { background: 'var(--surface-sunken)', color: 'var(--text-heading)' },
  ghost: { background: 'transparent', color: 'var(--text-body)' },
  danger: { background: '#fdecea', color: '#c0392b' },
}

export function Button({
  variant = 'primary',
  full,
  loading,
  disabled,
  children,
  style,
  ...rest
}: ButtonProps) {
  return (
    <button
      {...rest}
      disabled={disabled || loading}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        border: 'none',
        borderRadius: 'var(--radius-pill)',
        fontFamily: 'var(--font-sans)',
        fontWeight: 800,
        fontSize: 15,
        padding: '14px 22px',
        width: full ? '100%' : undefined,
        opacity: disabled || loading ? 0.6 : 1,
        cursor: disabled || loading ? 'not-allowed' : 'pointer',
        transition: 'transform 0.1s ease, opacity 0.15s ease',
        ...VARIANT_STYLES[variant],
        ...style,
      }}
    >
      {loading && <Spinner size={16} color="currentColor" />}
      {children}
    </button>
  )
}

/* ---- Estado vacío ---- */
export function EmptyState({
  icon,
  title,
  body,
  action,
}: {
  icon?: ReactNode
  title: string
  body?: string
  action?: ReactNode
}) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        gap: 10,
        padding: '48px 24px',
      }}
    >
      {icon && (
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: 20,
            background: 'var(--gradient-wave-soft)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 4,
          }}
        >
          {icon}
        </div>
      )}
      <h3 style={{ fontSize: 17, fontWeight: 800, color: 'var(--text-heading)' }}>{title}</h3>
      {body && <p style={{ fontSize: 14, color: 'var(--text-muted)', maxWidth: 300 }}>{body}</p>}
      {action && <div style={{ marginTop: 8 }}>{action}</div>}
    </div>
  )
}

/* ---- Estado de error de carga (con reintento) ---- */
export function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <EmptyState
      icon={<Icon glyph="alert" size={28} color="var(--fde-danger)" />}
      title="No se pudo cargar"
      body="Revisá tu conexión a internet e intentá de nuevo."
      action={<Button onClick={onRetry}>Reintentar</Button>}
    />
  )
}

/* ---- Tarjeta ---- */
export function Card({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return (
    <div
      style={{
        background: 'var(--surface-card)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-md)',
        boxShadow: 'var(--shadow-xs)',
        ...style,
      }}
    >
      {children}
    </div>
  )
}
