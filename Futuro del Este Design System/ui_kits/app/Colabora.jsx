/* Futuro del Este App — Colaborá (donate / volunteer) screen. */
function AppColabora() {
  const { Button, Card, Badge } = window.FuturoDelEsteDesignSystem_2e0290;
  const [amount, setAmount] = React.useState(500);
  const amounts = [200, 500, 1000, 2500];
  return (
    <div style={{ paddingBottom: 30 }}>
      <div style={{ background: 'var(--gradient-deep)', padding: '54px 20px 28px', borderBottomLeftRadius: 26, borderBottomRightRadius: 26 }}>
        <Badge tone="aqua" soft={false}>Sumate al cambio</Badge>
        <h2 style={{ color: '#fff', margin: '12px 0 6px', fontSize: 25 }}>Colaborá con la fundación</h2>
        <p style={{ color: 'rgba(255,255,255,0.78)', margin: 0, fontSize: 14, lineHeight: 1.55 }}>
          Tu aporte sostiene proyectos de inclusión y cuidado ambiental en el Este.
        </p>
      </div>

      <div style={{ padding: '22px 20px' }}>
        <h3 style={{ fontSize: 16, margin: '0 0 12px' }}>Elegí un monto (UYU)</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 22 }}>
          {amounts.map((a) => {
            const sel = amount === a;
            return (
              <button key={a} onClick={() => setAmount(a)} style={{
                padding: '16px', borderRadius: 16, cursor: 'pointer',
                border: sel ? '2px solid var(--color-primary)' : '1.5px solid var(--border-strong)',
                background: sel ? 'var(--fde-cyan-50)' : 'var(--surface-card)',
                color: sel ? 'var(--fde-cyan-700)' : 'var(--text-heading)',
                fontWeight: 800, fontSize: 19, fontFamily: 'var(--font-sans)',
                boxShadow: sel ? 'var(--shadow-sm)' : 'none',
              }}>${a}</button>
            );
          })}
        </div>

        <Card padding="md" style={{ marginBottom: 18 }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <div style={{ fontSize: 26 }}>♿</div>
            <div>
              <div style={{ fontWeight: 800, color: 'var(--text-heading)', fontSize: 15 }}>Becas de Turismo Accesible</div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Tu aporte financia formación inclusiva.</div>
            </div>
          </div>
        </Card>

        <Button variant="primary" full size="lg">Donar ${amount}</Button>
        <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-muted)', marginTop: 12 }}>
          Pago seguro · Recibís comprobante por email
        </p>
      </div>
    </div>
  );
}
window.AppColabora = AppColabora;
