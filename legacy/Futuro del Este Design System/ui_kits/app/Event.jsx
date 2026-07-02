/* Futuro del Este App — Event detail screen. */
function AppEvent({ onBack }) {
  const { Badge, Button } = window.FuturoDelEsteDesignSystem_2e0290;
  const [going, setGoing] = React.useState(false);
  return (
    <div style={{ paddingBottom: 96 }}>
      <div style={{ position: 'relative', height: 220 }}>
        <div style={{ position: 'absolute', inset: 0, background: 'var(--gradient-wave)' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(19,59,92,0.15), rgba(19,59,92,0.55))' }} />
        <button onClick={onBack} style={{
          position: 'absolute', top: 50, left: 18, width: 40, height: 40, borderRadius: '50%',
          border: 'none', background: 'rgba(255,255,255,0.9)', cursor: 'pointer', fontSize: 18,
          display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--fde-navy)',
        }}>←</button>
        <div style={{ position: 'absolute', left: 20, bottom: 18, right: 20 }}>
          <Badge tone="cyan" soft={false}>Deporte adaptado</Badge>
          <h2 style={{ color: '#fff', margin: '10px 0 0', fontSize: 24, lineHeight: 1.12 }}>
            Esgrima Olímpica y Paralímpica
          </h2>
        </div>
      </div>

      <div style={{ padding: '20px' }}>
        <div style={{ display: 'flex', gap: 12, marginBottom: 18 }}>
          {[['📅', 'Sábado 13 de junio'], ['🕚', '11:00 hs'], ['📍', 'Gimnasio Academy']].map(([ic, t]) => (
            <div key={t} style={{
              flex: 1, background: 'var(--surface-sunken)', borderRadius: 14, padding: '12px 10px', textAlign: 'center',
            }}>
              <div style={{ fontSize: 18 }}>{ic}</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-heading)', marginTop: 4, lineHeight: 1.25 }}>{t}</div>
            </div>
          ))}
        </div>

        <h3 style={{ fontSize: 17, margin: '0 0 8px' }}>Sobre la actividad</h3>
        <p style={{ color: 'var(--text-body)', lineHeight: 1.65, margin: '0 0 16px' }}>
          Práctica abierta a todo público, con o sin experiencia previa, dictada por el Maestro de Armas
          Franco De Cante. Una jornada para acercar el deporte adaptado a la comunidad del Este.
        </p>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10, padding: '14px 16px',
          background: 'var(--fde-emerald-50)', borderRadius: 14, color: 'var(--fde-pine)', fontWeight: 700, fontSize: 14,
        }}>
          ✓ Entrada gratuita — confirmá tu asistencia
        </div>
      </div>

      {/* Sticky CTA */}
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 0, padding: '14px 20px 22px',
        background: 'linear-gradient(180deg, rgba(255,255,255,0), var(--surface-card) 28%)',
        display: 'flex', gap: 12,
      }}>
        <Button variant={going ? 'secondary' : 'primary'} full size="lg" onClick={() => setGoing(!going)}>
          {going ? '✓ Asistencia confirmada' : 'Confirmar asistencia'}
        </Button>
      </div>
    </div>
  );
}
window.AppEvent = AppEvent;
