import { useEffect, type ReactNode } from 'react'
import { Icon } from './Icon'

interface SheetProps {
  open: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  /** Oculta el botón de cierre (para hojas obligatorias como T&C). */
  dismissible?: boolean
}

/** Hoja inferior (bottom sheet) accesible con overlay y animación. */
export function Sheet({ open, onClose, title, children, dismissible = true }: SheetProps) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && dismissible) onClose()
    }
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKey)
    }
  }, [open, dismissible, onClose])

  if (!open) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onClick={() => dismissible && onClose()}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(17, 37, 50, 0.5)',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        zIndex: 3000,
        animation: 'fde-fade-in 0.18s ease',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: 'var(--app-max)',
          background: 'var(--surface-card)',
          borderRadius: '24px 24px 0 0',
          boxShadow: '0 -8px 30px rgba(19,59,92,0.2)',
          maxHeight: '92dvh',
          overflowY: 'auto',
          paddingBottom: 'calc(20px + var(--safe-bottom))',
          animation: 'fde-sheet-in 0.26s cubic-bezier(0.22, 1, 0.36, 1)',
        }}
        className="no-scrollbar"
      >
        <div
          style={{
            position: 'sticky',
            top: 0,
            background: 'var(--surface-card)',
            paddingTop: 10,
            zIndex: 1,
          }}
        >
          <div
            style={{
              width: 40,
              height: 4,
              borderRadius: 2,
              background: 'var(--border-strong)',
              margin: '0 auto 6px',
            }}
          />
          {(title || dismissible) && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '6px 20px 12px',
              }}
            >
              <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-heading)', margin: 0 }}>
                {title}
              </h2>
              {dismissible && (
                <button
                  onClick={onClose}
                  aria-label="Cerrar"
                  style={{
                    border: 'none',
                    background: 'var(--surface-sunken)',
                    borderRadius: '50%',
                    width: 34,
                    height: 34,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Icon glyph="x" size={18} color="var(--text-muted)" />
                </button>
              )}
            </div>
          )}
        </div>
        <div style={{ padding: '0 20px' }}>{children}</div>
      </div>
    </div>
  )
}
