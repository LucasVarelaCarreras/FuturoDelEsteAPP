/* Futuro del Este — Mission statements + impact band. */
function SiteMission() {
  const { WaveDivider, Badge } = window.FuturoDelEsteDesignSystem_2e0290;
  const statements = [
    { t: 'Cambio cultural', d: 'Contribuimos a generar un cambio cultural que permita incorporar, de forma orgánica, conceptos de sustentabilidad y accesibilidad en todos los proyectos.' },
    { t: 'En alianza', d: 'Junto a instituciones locales, nacionales e internacionales, brindamos experiencias para concientizar e incorporar aprendizajes sobre inclusión y sustentabilidad.' },
    { t: 'Naturalizar la inclusión', d: 'Buscamos naturalizar la inclusión de las personas con discapacidad y el cuidado ambiental del impacto que provoca cualquier intervención.' },
  ];
  return (
    <section style={{ background: 'var(--surface-card)', padding: '0 0 10px' }}>
      <div style={{ maxWidth: 'var(--container-max)', margin: '0 auto', padding: '70px 24px 40px', textAlign: 'center' }}>
        <Badge tone="emerald" dot>Quiénes somos</Badge>
        <h2 style={{ margin: '18px auto 8px', maxWidth: 760, fontSize: 'clamp(26px,3.4vw,40px)' }}>
          Naturalizar la inclusión y el cuidado del ambiente
        </h2>
        <p style={{ maxWidth: 620, margin: '0 auto', color: 'var(--text-muted)', fontSize: 18 }}>
          Una fundación del Este de Uruguay que une sustentabilidad y accesibilidad.
        </p>
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: 28, marginTop: 52, textAlign: 'left',
        }}>
          {statements.map((s, i) => (
            <div key={i}>
              <div style={{
                width: 52, height: 52, borderRadius: 16, marginBottom: 18,
                background: 'var(--gradient-wave)', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 22,
                boxShadow: 'var(--shadow-brand)',
              }}>{i + 1}</div>
              <h3 style={{ fontSize: 21, marginBottom: 8 }}>{s.t}</h3>
              <p style={{ color: 'var(--text-body)', margin: 0, lineHeight: 1.6 }}>{s.d}</p>
            </div>
          ))}
        </div>
      </div>
      <WaveDivider gradient height={72} />
    </section>
  );
}
window.SiteMission = SiteMission;
