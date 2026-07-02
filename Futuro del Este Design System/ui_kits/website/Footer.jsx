/* Futuro del Este — Website footer with social links. */
function SiteFooter() {
  const { Logo } = window.FuturoDelEsteDesignSystem_2e0290;
  const socials = ['LinkedIn', 'Facebook', 'Instagram', 'X', 'WhatsApp'];
  return (
    <footer style={{ background: 'var(--fde-navy)', color: 'rgba(255,255,255,0.8)' }}>
      <div style={{
        maxWidth: 'var(--container-max)', margin: '0 auto', padding: '52px 24px 30px',
        display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 32,
      }}>
        <div style={{ maxWidth: 320 }}>
          <Logo variant="lockup-horizontal" size={40} tone="white" />
          <p style={{ marginTop: 18, fontSize: 14, lineHeight: 1.6, color: 'rgba(255,255,255,0.7)' }}>
            Fundación del Este de Uruguay dedicada a la sustentabilidad y la accesibilidad.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', flexWrap: 'wrap' }}>
          {socials.map((s) => (
            <a key={s} href="#" style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              height: 40, padding: '0 16px', borderRadius: 'var(--radius-pill)',
              background: 'rgba(255,255,255,0.10)', color: '#fff',
              fontSize: 13, fontWeight: 700, textDecoration: 'none',
            }}>{s}</a>
          ))}
        </div>
      </div>
      <div style={{
        borderTop: '1px solid rgba(255,255,255,0.12)', padding: '18px 24px',
        textAlign: 'center', fontSize: 13, color: 'rgba(255,255,255,0.55)',
      }}>
        © 2026 Fundación Futuro del Este · www.futurodeleste.org
      </div>
    </footer>
  );
}
window.SiteFooter = SiteFooter;
