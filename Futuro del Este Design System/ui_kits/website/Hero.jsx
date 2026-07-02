/* Futuro del Este — Website hero.
   The only supplied hero image is the original site screenshot (with
   nav + logo + tagline baked in), so we use a clean brand gradient
   panel with the live lockup instead. Swap in a text-free community
   photo when one is available. */
function SiteHero() {
  const { Logo, WaveDivider } = window.FuturoDelEsteDesignSystem_2e0290;
  return (
    <header style={{ position: 'relative', minHeight: 580, overflow: 'hidden', background: 'var(--gradient-deep)' }}>
      {/* soft decorative wave layers echoing the mark */}
      <svg viewBox="0 0 1200 580" preserveAspectRatio="xMidYMid slice" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} aria-hidden="true">
        <path d="M0,360 C300,300 520,440 760,380 C980,325 1080,400 1200,360 L1200,580 L0,580 Z" fill="#019AC4" opacity="0.22" />
        <path d="M0,430 C260,380 500,500 760,440 C1000,385 1100,460 1200,425 L1200,580 L0,580 Z" fill="#1DC9C9" opacity="0.16" />
        <circle cx="1010" cy="150" r="210" fill="#01B8A4" opacity="0.10" />
        <circle cx="180" cy="120" r="150" fill="#1DC9C9" opacity="0.10" />
      </svg>

      <div style={{
        position: 'relative', zIndex: 2,
        minHeight: 580, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', textAlign: 'center',
        padding: '120px 24px 90px',
      }}>
        <Logo variant="lockup" size={118} tone="white" style={{ flexDirection: 'column', gap: 18 }} />
        <h1 style={{
          marginTop: 34, marginBottom: 0, fontSize: 'clamp(34px, 5vw, 58px)', fontWeight: 800,
          lineHeight: 1.1, color: '#fff', letterSpacing: '-0.01em',
        }}>Sustentabilidad <span style={{ color: 'var(--fde-aqua)' }}>+</span> Accesibilidad</h1>
        <p style={{ marginTop: 22, fontSize: 19, color: 'rgba(255,255,255,0.82)', maxWidth: 560 }}>
          Una fundación del Este de Uruguay que une el cuidado ambiental y la inclusión.
        </p>
      </div>

      <div style={{ position: 'absolute', left: 0, right: 0, bottom: -1, zIndex: 2 }}>
        <WaveDivider fill="var(--surface-card)" height={70} />
      </div>
    </header>
  );
}
window.SiteHero = SiteHero;
