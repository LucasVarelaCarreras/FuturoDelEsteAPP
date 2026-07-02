/* Futuro del Este App — phone shell, status bar, bottom tab nav + routing. */
function AppShell() {
  const [tab, setTab] = React.useState('home');
  const [screen, setScreen] = React.useState('home'); // home | event | colabora

  const go = (t) => { setTab(t); setScreen(t); };

  const tabs = [
    { id: 'home', label: 'Inicio', icon: '🏠' },
    { id: 'event', label: 'Agenda', icon: '📅' },
    { id: 'colabora', label: 'Colaborá', icon: '🤝' },
    { id: 'perfil', label: 'Perfil', icon: '👤' },
  ];

  let body;
  if (screen === 'event') body = <AppEvent onBack={() => go('home')} />;
  else if (screen === 'colabora') body = <AppColabora />;
  else if (screen === 'perfil') body = <AppPerfil />;
  else body = <AppHome onOpenEvent={() => setScreen('event')} />;

  return (
    <div style={{
      width: 390, height: 800, position: 'relative', background: 'var(--surface-page)',
      borderRadius: 44, overflow: 'hidden', boxShadow: '0 40px 90px rgba(17,37,50,0.30)',
      border: '11px solid #0E1F2C',
    }}>
      {/* Status bar */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, zIndex: 30, height: 44,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 26px', color: '#fff', fontSize: 13, fontWeight: 700, pointerEvents: 'none',
      }}>
        <span>9:41</span>
        <span>📶 100%</span>
      </div>

      {/* Scroll area */}
      <div style={{ position: 'absolute', inset: 0, bottom: 76, overflowY: 'auto' }}>
        {body}
      </div>

      {/* Bottom tab bar */}
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 0, height: 76,
        background: 'var(--surface-card)', borderTop: '1px solid var(--border-subtle)',
        display: 'flex', paddingBottom: 10,
      }}>
        {tabs.map((t) => {
          const active = tab === t.id;
          return (
            <button key={t.id} onClick={() => go(t.id)} style={{
              flex: 1, border: 'none', background: 'none', cursor: 'pointer',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3,
              color: active ? 'var(--color-primary)' : 'var(--text-muted)',
              fontWeight: active ? 800 : 600, fontSize: 11, fontFamily: 'var(--font-sans)',
            }}>
              <span style={{ fontSize: 19, filter: active ? 'none' : 'grayscale(0.5)', opacity: active ? 1 : 0.7 }}>{t.icon}</span>
              {t.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function AppPerfil() {
  const { Card, Badge } = window.FuturoDelEsteDesignSystem_2e0290;
  return (
    <div style={{ paddingBottom: 24 }}>
      <div style={{ background: 'var(--gradient-deep)', padding: '60px 20px 30px', textAlign: 'center', borderBottomLeftRadius: 26, borderBottomRightRadius: 26 }}>
        <div style={{ width: 78, height: 78, borderRadius: '50%', margin: '0 auto 12px', background: 'var(--gradient-wave)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, border: '3px solid rgba(255,255,255,0.5)' }}>👩</div>
        <h2 style={{ color: '#fff', margin: 0, fontSize: 22 }}>Lucía Fernández</h2>
        <p style={{ color: 'rgba(255,255,255,0.75)', margin: '4px 0 0', fontSize: 14 }}>Voluntaria desde 2024</p>
      </div>
      <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
        <Card padding="md"><div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><span style={{ fontWeight: 700, color: 'var(--text-heading)' }}>Actividades</span><Badge tone="emerald">7 asistidas</Badge></div></Card>
        <Card padding="md"><div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><span style={{ fontWeight: 700, color: 'var(--text-heading)' }}>Aportes</span><Badge tone="cyan">$3.500</Badge></div></Card>
        {['Mis inscripciones', 'Notificaciones', 'Configuración', 'Ayuda'].map((r) => (
          <div key={r} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 4px', borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-body)', fontWeight: 600 }}>{r}<span style={{ color: 'var(--text-muted)' }}>›</span></div>
        ))}
      </div>
    </div>
  );
}
window.AppShell = AppShell;
window.AppPerfil = AppPerfil;
