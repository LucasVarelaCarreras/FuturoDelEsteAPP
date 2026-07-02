/* Futuro del Este — Website navigation bar.
   Translucent navy bar over the hero, white wordmark + links. */
function SiteNav() {
  const { Logo } = window.FuturoDelEsteDesignSystem_2e0290;
  const links = ['Inicio', 'Quiénes somos', 'Qué hacemos', 'Contactanos', 'Novedades', 'Colaborá'];
  const [active, setActive] = React.useState('Inicio');
  return (
    <nav style={{
      position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10,
      height: 'var(--header-height)',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 clamp(20px, 4vw, 56px)',
      background: 'rgba(19, 59, 92, 0.78)',
      backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)',
    }}>
      <Logo variant="lockup-horizontal" size={34} tone="white" />
      <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(14px, 2vw, 30px)' }}>
        {links.map((l) => (
          <button key={l} onClick={() => setActive(l)} style={{
            border: 'none', background: 'none', cursor: 'pointer',
            fontFamily: 'var(--font-sans)', fontSize: 15,
            fontWeight: active === l ? 800 : 500,
            color: '#fff', opacity: active === l ? 1 : 0.86,
            padding: '6px 2px', borderBottom: active === l ? '2px solid #fff' : '2px solid transparent',
            transition: 'opacity var(--dur-fast) var(--ease-standard)',
          }}>{l}</button>
        ))}
      </div>
    </nav>
  );
}
window.SiteNav = SiteNav;
