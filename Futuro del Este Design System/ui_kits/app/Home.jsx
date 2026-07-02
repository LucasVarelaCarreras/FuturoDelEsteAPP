/* Futuro del Este App — Home / feed screen. */
function AppHome({ onOpenEvent }) {
  const { Badge, Logo } = window.FuturoDelEsteDesignSystem_2e0290;
  const events = [
    { tone: 'cyan', tag: 'Deporte', date: '13 JUN', title: 'Esgrima Olímpica y Paralímpica', place: 'Gimnasio Academy · 11:00' },
    { tone: 'emerald', tag: 'Ambiente', date: '05 JUN', title: 'Día Mundial del Medio Ambiente', place: 'Playa Brava · 09:00' },
  ];
  return (
    <div style={{ paddingBottom: 24 }}>
      {/* Header */}
      <div style={{
        background: 'var(--gradient-deep)', padding: '54px 20px 26px',
        borderBottomLeftRadius: 26, borderBottomRightRadius: 26, color: '#fff',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Logo variant="lockup-horizontal" size={30} tone="white" />
          <div style={{
            width: 38, height: 38, borderRadius: '50%', background: 'rgba(255,255,255,0.16)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
          }}>🔔</div>
        </div>
        <p style={{ margin: '22px 0 4px', fontSize: 14, color: 'rgba(255,255,255,0.75)' }}>¡Hola, Lucía!</p>
        <h2 style={{ margin: 0, color: '#fff', fontSize: 25, lineHeight: 1.15 }}>
          Sumate a las próximas actividades
        </h2>
      </div>

      {/* Quick actions */}
      <div style={{ display: 'flex', gap: 12, padding: '20px 20px 6px' }}>
        {[['🌱', 'Ambiente'], ['♿', 'Inclusión'], ['🤝', 'Colaborá']].map(([ic, l]) => (
          <div key={l} style={{
            flex: 1, background: 'var(--surface-card)', border: '1px solid var(--border-subtle)',
            borderRadius: 16, padding: '14px 8px', textAlign: 'center', boxShadow: 'var(--shadow-xs)',
          }}>
            <div style={{ fontSize: 22 }}>{ic}</div>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-heading)', marginTop: 6 }}>{l}</div>
          </div>
        ))}
      </div>

      <div style={{ padding: '18px 20px 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <h3 style={{ margin: 0, fontSize: 18 }}>Próximos eventos</h3>
        <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-link)' }}>Ver todos</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, padding: '0 20px' }}>
        {events.map((e, i) => (
          <button key={i} onClick={onOpenEvent} style={{
            textAlign: 'left', border: '1px solid var(--border-subtle)', cursor: 'pointer',
            background: 'var(--surface-card)', borderRadius: 18, padding: 14,
            display: 'flex', gap: 14, alignItems: 'center', boxShadow: 'var(--shadow-sm)',
          }}>
            <div style={{
              width: 58, height: 58, borderRadius: 14, flexShrink: 0,
              background: 'var(--gradient-wave)', color: '#fff', display: 'flex',
              flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'var(--font-display)', lineHeight: 1,
            }}>
              <span style={{ fontSize: 20, fontWeight: 700 }}>{e.date.split(' ')[0]}</span>
              <span style={{ fontSize: 11, letterSpacing: '.06em' }}>{e.date.split(' ')[1]}</span>
            </div>
            <div style={{ minWidth: 0 }}>
              <Badge tone={e.tone}>{e.tag}</Badge>
              <div style={{ fontWeight: 800, color: 'var(--text-heading)', margin: '6px 0 3px', fontSize: 15 }}>{e.title}</div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{e.place}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
window.AppHome = AppHome;
