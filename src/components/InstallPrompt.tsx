import { useEffect, useState } from 'react'
import { Icon } from './Icon'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

const DISMISS_KEY = 'fde_install_dismissed'

function isIos(): boolean {
  return /iphone|ipad|ipod/i.test(navigator.userAgent)
}
function isStandalone(): boolean {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    // iOS Safari
    (window.navigator as unknown as { standalone?: boolean }).standalone === true
  )
}

/**
 * Invita a instalar la PWA. En Android usa el evento nativo
 * `beforeinstallprompt`; en iOS muestra la instrucción manual.
 */
export function InstallPrompt() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null)
  const [showIosHint, setShowIosHint] = useState(false)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (isStandalone() || localStorage.getItem(DISMISS_KEY)) return

    const onBeforeInstall = (e: Event) => {
      e.preventDefault()
      setDeferred(e as BeforeInstallPromptEvent)
      setVisible(true)
    }
    window.addEventListener('beforeinstallprompt', onBeforeInstall)

    // iOS no dispara beforeinstallprompt: mostramos la pista manual.
    if (isIos()) {
      const t = setTimeout(() => {
        setShowIosHint(true)
        setVisible(true)
      }, 1200)
      return () => {
        clearTimeout(t)
        window.removeEventListener('beforeinstallprompt', onBeforeInstall)
      }
    }

    return () => window.removeEventListener('beforeinstallprompt', onBeforeInstall)
  }, [])

  const dismiss = () => {
    setVisible(false)
    localStorage.setItem(DISMISS_KEY, '1')
  }

  const install = async () => {
    if (!deferred) return
    await deferred.prompt()
    await deferred.userChoice
    dismiss()
  }

  if (!visible) return null

  return (
    <div
      role="dialog"
      aria-label="Instalar aplicación"
      style={{
        position: 'fixed',
        left: '50%',
        bottom: 'calc(var(--nav-height) + var(--safe-bottom) + 14px)',
        transform: 'translateX(-50%)',
        width: 'calc(100% - 28px)',
        maxWidth: 'calc(var(--app-max) - 28px)',
        background: 'var(--surface-card)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-md)',
        boxShadow: 'var(--shadow-md)',
        padding: 14,
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        zIndex: 2500,
        animation: 'fde-toast-in 0.25s ease',
      }}
    >
      <div
        style={{
          width: 42,
          height: 42,
          borderRadius: 12,
          background: 'var(--gradient-wave)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flex: '0 0 42px',
        }}
      >
        <Icon glyph="home" size={22} color="#fff" />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 800, fontSize: 14, color: 'var(--text-heading)' }}>Instalá la app</div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.4 }}>
          {showIosHint ? (
            <>
              Tocá <b>Compartir</b> y luego <b>Añadir a pantalla de inicio</b>.
            </>
          ) : (
            'Accedé más rápido desde tu pantalla de inicio.'
          )}
        </div>
      </div>
      {!showIosHint && (
        <button
          onClick={install}
          style={{
            border: 'none',
            background: 'var(--color-primary)',
            color: '#fff',
            fontWeight: 800,
            fontSize: 13,
            padding: '9px 15px',
            borderRadius: 'var(--radius-pill)',
            flex: '0 0 auto',
          }}
        >
          Instalar
        </button>
      )}
      <button onClick={dismiss} aria-label="Cerrar" style={{ border: 'none', background: 'none', padding: 4, flex: '0 0 auto' }}>
        <Icon glyph="x" size={18} color="var(--text-muted)" />
      </button>
    </div>
  )
}
