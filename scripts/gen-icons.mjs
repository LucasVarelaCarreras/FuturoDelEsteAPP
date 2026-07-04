/**
 * Genera todos los íconos de la app a partir del logo OFICIAL de la
 * fundación (`logo.png`, en la raíz del repo): el círculo de olas
 * verde-turquesa-azul con aro blanco.
 *
 * El PNG original trae el círculo sobre un fondo oscuro opaco, así que
 * acá se recorta el círculo (máscara circular medida sobre el archivo)
 * y se vuelve a dibujar el aro blanco del borde para tapar el halo del
 * antialias contra el fondo original.
 *
 * Salidas:
 *   - public/icons/icon-192.png / icon-512.png  (PWA "any", fondo transparente)
 *   - public/icons/apple-touch-icon.png          (iOS, fondo blanco opaco)
 *   - public/icons/maskable-192.png / -512.png   (PWA maskable: logo centrado
 *     en zona segura sobre fondo a sangre con el degradé de marca)
 *   - public/favicon.svg                         (logo embebido como data URI)
 *   - src/assets/logo.png                        (para el header y el login)
 */
import sharp from 'sharp'
import { mkdirSync, writeFileSync } from 'node:fs'

mkdirSync('public/icons', { recursive: true })
mkdirSync('src/assets', { recursive: true })

// Geometría del círculo dentro de logo.png (medida píxel a píxel):
// centro ≈ (103.5, 102), radio exterior del aro blanco ≈ 94.
const SRC = 'logo.png'
const CROP = { left: 10, top: 8, width: 188, height: 188 }

/** Círculo del logo con fondo transparente, en el tamaño pedido. */
async function circleLogo(size) {
  const base = await sharp(SRC).extract(CROP).resize(size, size).png().toBuffer()
  const c = size / 2
  // La máscara queda apenas por dentro del borde para descartar los píxeles
  // antialiasados contra el fondo oscuro original.
  const rMask = c - Math.max(1, size / 90)
  const ringW = Math.max(1.5, size * 0.026)
  const mask = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}"><circle cx="${c}" cy="${c}" r="${rMask}" fill="#fff"/></svg>`,
  )
  // Aro blanco limpio redibujado sobre el borde.
  const ring = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}"><circle cx="${c}" cy="${c}" r="${rMask - ringW / 2 + 0.5}" fill="none" stroke="#fff" stroke-width="${ringW}"/></svg>`,
  )
  return sharp(base)
    .composite([
      { input: mask, blend: 'dest-in' },
      { input: ring, blend: 'over' },
    ])
    .png()
    .toBuffer()
}

/** Logo centrado sobre un fondo (SVG) a sangre. */
async function onBackground(size, logoRatio, bgSvg) {
  const logoSize = Math.round(size * logoRatio)
  const logo = await circleLogo(logoSize)
  const off = Math.round((size - logoSize) / 2)
  return sharp(Buffer.from(bgSvg))
    .resize(size, size)
    .composite([{ input: logo, left: off, top: off }])
    .png()
    .toBuffer()
}

const gradientBg = (s) => `<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}">
  <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#01B8A4"/><stop offset="0.5" stop-color="#019AC4"/><stop offset="1" stop-color="#01608F"/>
  </linearGradient></defs>
  <rect width="${s}" height="${s}" fill="url(#g)"/>
</svg>`

const whiteBg = (s) => `<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}"><rect width="${s}" height="${s}" fill="#FFFFFF"/></svg>`

async function write(buffer, out) {
  writeFileSync(out, buffer)
  console.log('wrote', out)
}

// Íconos "any": el círculo del logo ocupa todo el lienzo (fondo transparente).
await write(await circleLogo(192), 'public/icons/icon-192.png')
await write(await circleLogo(512), 'public/icons/icon-512.png')

// iOS no admite transparencia (la rellena de negro): fondo blanco como el
// del logo oficial impreso.
await write(await onBackground(180, 0.88, whiteBg(180)), 'public/icons/apple-touch-icon.png')

// Maskable: fondo a sangre con el degradé de marca y el logo centrado en la
// zona segura (el SO puede recortar hasta un 20% de cada lado).
await write(await onBackground(192, 0.64, gradientBg(192)), 'public/icons/maskable-192.png')
await write(await onBackground(512, 0.64, gradientBg(512)), 'public/icons/maskable-512.png')

// Favicon: SVG con el logo embebido (data URI), fondo transparente.
const fav = await circleLogo(96)
writeFileSync(
  'public/favicon.svg',
  `<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96"><image width="96" height="96" href="data:image/png;base64,${fav.toString('base64')}"/></svg>`,
)
console.log('wrote public/favicon.svg')

// Versión transparente para usar dentro de la app (header, login).
await write(await circleLogo(192), 'src/assets/logo.png')

writeFileSync('public/robots.txt', 'User-agent: *\nAllow: /\n')
console.log('done')
