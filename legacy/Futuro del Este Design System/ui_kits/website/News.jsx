/* Futuro del Este — Novedades (news) grid + Colaborá call to action. */
function SiteNews() {
  const { Card, Badge, Button } = window.FuturoDelEsteDesignSystem_2e0290;
  const news = [
    { tone: 'cyan', tag: 'Evento', date: '13 JUN', title: 'Práctica de Esgrima Olímpica y Paralímpica', body: 'Entrada gratuita, abierta a todo público con o sin experiencia previa.' },
    { tone: 'emerald', tag: 'Ambiente', date: '05 JUN', title: 'Día Mundial del Medio Ambiente', body: 'Actividades de concientización sobre el impacto de nuestras intervenciones.' },
    { tone: 'aqua', tag: 'Becas', date: '01 JUN', title: 'Beca completa en Turismo Accesible', body: '¡Ya tenemos ganador! Gracias a todas las personas que se postularon.' },
  ];
  return (
    <section style={{ background: 'var(--surface-page)', padding: '64px 24px 80px' }}>
      <div style={{ maxWidth: 'var(--container-max)', margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginBottom: 34 }}>
          <div>
            <Badge tone="cyan">Novedades</Badge>
            <h2 style={{ margin: '14px 0 0', fontSize: 'clamp(26px,3.2vw,38px)' }}>Lo último de la fundación</h2>
          </div>
          <Button variant="outline" size="sm">Ver todas</Button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 26 }}>
          {news.map((n, i) => (
            <Card key={i} accent interactive padding="lg">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <Badge tone={n.tone}>{n.tag}</Badge>
                <Badge tone="ocean" soft={false}>{n.date}</Badge>
              </div>
              <h3 style={{ fontSize: 21, marginBottom: 10 }}>{n.title}</h3>
              <p style={{ color: 'var(--text-body)', margin: '0 0 18px', lineHeight: 1.6 }}>{n.body}</p>
              <a href="#" style={{ fontWeight: 800, color: 'var(--text-link)' }}>Leer más →</a>
            </Card>
          ))}
        </div>

        <div style={{
          marginTop: 56, borderRadius: 'var(--radius-xl)', overflow: 'hidden',
          background: 'var(--gradient-deep)', padding: 'clamp(32px, 5vw, 56px)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexWrap: 'wrap', gap: 24,
        }}>
          <div style={{ maxWidth: 560 }}>
            <h2 style={{ color: '#fff', fontSize: 'clamp(26px,3.2vw,38px)', margin: '0 0 10px' }}>Sumate al cambio</h2>
            <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: 18, margin: 0 }}>
              Colaborá con nuestros proyectos de inclusión y sustentabilidad en el Este.
            </p>
          </div>
          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
            <Button variant="primary" size="lg">Colaborá</Button>
            <Button variant="outline" size="lg" style={{ color: '#fff', borderColor: 'rgba(255,255,255,0.6)' }}>Contactanos</Button>
          </div>
        </div>
      </div>
    </section>
  );
}
window.SiteNews = SiteNews;
