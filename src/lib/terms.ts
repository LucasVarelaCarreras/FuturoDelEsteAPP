/**
 * Documentos legales vigentes para atletas guía (acompañantes).
 * Son los documentos reales de la Fundación Futuro del Este:
 *   - Deslinde de responsabilidad (Programa Escuela de Atleta Guía)
 *   - Cesión de derechos y autorización de uso de imagen
 * Se sirven como PDF desde /public/legal y se muestran íntegros al
 * usuario mediante los links de la pantalla de aceptación.
 *
 * TERMS_VERSION y los hashes quedan registrados en `tc_acceptances`
 * para trazabilidad legal. Si algún documento cambia, hay que:
 *   1. Reemplazar el PDF en public/legal/
 *   2. Recalcular su hash (sha256sum public/legal/archivo.pdf)
 *   3. Subir TERMS_VERSION
 */
export const TERMS_VERSION = '1.0'

export const TERMS_TITLE = 'Antes de continuar'

export interface LegalDoc {
  key: string
  label: string
  file: string
  /** SHA-256 del PDF exacto vigente (auditoría). */
  sha256: string
}

export const LEGAL_DOCS: LegalDoc[] = [
  {
    key: 'deslinde',
    label: 'Deslinde de responsabilidad',
    file: '/legal/deslinde-responsabilidad.pdf',
    sha256: '814e391c25de646df437aaa447b91fd564c1f82afc77fe6bdbf39e3311561e8b',
  },
  {
    key: 'cesion',
    label: 'Cesión de derechos y uso de imagen',
    file: '/legal/cesion-imagen.pdf',
    sha256: 'a4c068925c45d490da7eed2233aef6c820f2e2c2db4cc28d4222e5facd337a5b',
  },
]

/** Resumen breve mostrado en pantalla (el detalle completo está en los PDF). */
export const TERMS_SUMMARY = [
  'Participás como voluntario/a en el Programa Escuela de Atleta Guía, asumiendo los riesgos propios de la actividad física y liberando a la Fundación de reclamos por lesiones o imprevistos durante los entrenamientos y carreras.',
  'Autorizás a la Fundación Futuro del Este a usar tus fotos, videos y nombre —tomados durante las actividades— para difusión institucional (redes sociales, folletos, etc.), en forma gratuita.',
  'Tus datos personales se usan únicamente para gestionar tu participación en el programa.',
]

/** Hash combinado de ambos documentos (para el registro de auditoría). */
export async function computeTermsHash(): Promise<string> {
  try {
    const combined = LEGAL_DOCS.map((d) => d.sha256).join('|')
    const data = new TextEncoder().encode(combined)
    const buf = await crypto.subtle.digest('SHA-256', data)
    return Array.from(new Uint8Array(buf))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('')
  } catch {
    return ''
  }
}
