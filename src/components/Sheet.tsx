import { useEffect, useRef, type ReactNode } from 'react'
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
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && dismissible) {
        onClose()
        return
      }
      // Focus trap: el Tab circula dentro de la hoja (diálogo modal).
      if (e.key === 'Tab' && panelRef.current) {
        const focusables = Array.from(
          panelRef.current.querySelectorAll<HTMLElement>(
            'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
          ),
        ).filter((el) => el.offsetParent !== null)
        if (focusables.length === 0) {
          e.preventDefault()
          panelRef.current.focus()
          return
        }
        const first = focusables[0]
        const last = focusables[focusables.length - 1]
        const active = document.activeElement as HTMLElement | null
        const inside = active ? panelRef.current.contains(active) : false
        if (e.shiftKey) {
          if (!inside || active === first) {
            e.preventDefault()
            last.focus()
          }
        } else if (!inside || active === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)

    // Accesibilidad: recordar el foco previo y mover el foco a la hoja.
    const previouslyFocused = document.activeElement as HTMLElement | null
    const focusTimer = setTimeout(() => panelRef.current?.focus(), 30)

    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKey)
      clearTimeout(focusTimer)
      previouslyFocused?.focus?.()
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
        ref={panelRef}
        tabIndex={-1}
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
          outline: 'none',
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
