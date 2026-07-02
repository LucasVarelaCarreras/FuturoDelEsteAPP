import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react'

interface ToastContextValue {
  notify: (message: string) => void
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState<string | null>(null)
  const timer = useRef<ReturnType<typeof setTimeout>>()

  const notify = useCallback((msg: string) => {
    if (timer.current) clearTimeout(timer.current)
    setMessage(msg)
    timer.current = setTimeout(() => setMessage(null), 2600)
  }, [])

  return (
    <ToastContext.Provider value={{ notify }}>
      {children}
      {message && (
        <div
          role="status"
          aria-live="polite"
          style={{
            position: 'fixed',
            left: '50%',
            bottom: 'calc(var(--nav-height) + var(--safe-bottom) + 18px)',
            transform: 'translateX(-50%)',
            background: 'var(--fde-navy)',
            color: '#fff',
            fontWeight: 700,
            fontSize: 14,
            padding: '12px 20px',
            borderRadius: 'var(--radius-pill)',
            boxShadow: 'var(--shadow-md)',
            zIndex: 4000,
            maxWidth: 'calc(100% - 32px)',
            textAlign: 'center',
            animation: 'fde-toast-in 0.22s ease',
          }}
        >
          {message}
        </div>
      )}
    </ToastContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast debe usarse dentro de <ToastProvider>')
  return ctx
}
