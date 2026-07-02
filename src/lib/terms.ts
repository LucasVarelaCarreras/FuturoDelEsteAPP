/**
 * Términos y Condiciones vigentes para atletas guía (acompañantes).
 * La versión y el hash quedan registrados en `tc_acceptances` para
 * trazabilidad legal. Al cambiar el texto, subir TERMS_VERSION.
 */
export const TERMS_VERSION = '1.0'

export const TERMS_TITLE = 'Términos y Condiciones · Atleta Guía'

export const TERMS_TEXT = `Fundación Futuro del Este — Acompañamiento de Atletas Guía

1. Objeto
Estos términos regulan la participación de las personas voluntarias
(“Atletas Guía” o acompañantes) que colaboran acompañando a los Atletas
Líder de la Fundación Futuro del Este en actividades, entrenamientos y
eventos deportivos.

2. Rol del Atleta Guía
El Atleta Guía se compromete a acompañar de manera responsable, respetuosa
y segura al Atleta Líder asignado, siguiendo las indicaciones del equipo
de la Fundación y priorizando siempre el bienestar del deportista.

3. Compromiso de asistencia
Al confirmar un acompañamiento, el Atleta Guía asume el compromiso de
asistir a la actividad. En caso de no poder asistir, deberá cancelar con la
mayor antelación posible para permitir la reasignación del cupo.

4. Deslinde de responsabilidad
El Atleta Guía participa de forma voluntaria y declara encontrarse en
condiciones físicas adecuadas. La Fundación no se responsabiliza por
lesiones derivadas de la actividad física propia del voluntario.

5. Uso de imagen
El Atleta Guía autoriza el uso de imágenes tomadas durante las actividades
con fines institucionales y de difusión de la Fundación, salvo manifestación
expresa en contrario.

6. Protección de datos
Los datos personales se tratan de forma confidencial y se utilizan
únicamente para la gestión de las actividades de la Fundación.

7. Conducta
Se espera un trato cordial, inclusivo y libre de cualquier forma de
discriminación o violencia. El incumplimiento puede implicar la baja del
programa de voluntariado.

Al aceptar, confirmás que leíste y estás de acuerdo con estos Términos y
Condiciones.`

/** Calcula el hash SHA-256 (hex) del texto vigente de los T&C. */
export async function computeTermsHash(text: string = TERMS_TEXT): Promise<string> {
  try {
    const data = new TextEncoder().encode(text)
    const buf = await crypto.subtle.digest('SHA-256', data)
    return Array.from(new Uint8Array(buf))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('')
  } catch {
    return ''
  }
}
