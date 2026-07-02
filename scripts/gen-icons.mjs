import sharp from 'sharp'
import { mkdirSync, writeFileSync } from 'node:fs'

mkdirSync('public/icons', { recursive: true })

// Mark sobre fondo claro (para icono "any" y favicon)
const anySvg = (s) => `<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}" viewBox="0 0 100 100">
  <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#01B8A4"/><stop offset="0.5" stop-color="#019AC4"/><stop offset="1" stop-color="#01608F"/>
  </linearGradient></defs>
  <rect width="100" height="100" rx="22" fill="#E2F3F9"/>
  <circle cx="50" cy="50" r="30" fill="url(#g)"/>
  <g fill="none" stroke="#fff" stroke-width="2.6" stroke-linecap="round">
    <path d="M32 43q5 -5 9 0t9 0t9 0"/><path d="M32 51q5 -5 9 0t9 0t9 0"/><path d="M32 59q5 -5 9 0t9 0t9 0"/>
  </g></svg>`

// Maskable: fondo a sangre con degradé + olas centradas (zona segura)
const maskSvg = (s) => `<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}" viewBox="0 0 100 100">
  <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#01B8A4"/><stop offset="0.5" stop-color="#019AC4"/><stop offset="1" stop-color="#01608F"/>
  </linearGradient></defs>
  <rect width="100" height="100" fill="url(#g)"/>
  <g fill="none" stroke="#fff" stroke-width="3.4" stroke-linecap="round">
    <path d="M28 42q6 -6 11 0t11 0t11 0"/><path d="M28 52q6 -6 11 0t11 0t11 0"/><path d="M28 62q6 -6 11 0t11 0t11 0"/>
  </g></svg>`

async function png(svg, size, out) {
  await sharp(Buffer.from(svg(size))).resize(size, size).png().toFile(out)
  console.log('wrote', out)
}

await png(anySvg, 192, 'public/icons/icon-192.png')
await png(anySvg, 512, 'public/icons/icon-512.png')
await png(anySvg, 180, 'public/icons/apple-touch-icon.png')
await png(maskSvg, 192, 'public/icons/maskable-192.png')
await png(maskSvg, 512, 'public/icons/maskable-512.png')

writeFileSync('public/favicon.svg', anySvg(100))
writeFileSync('public/robots.txt', 'User-agent: *\nAllow: /\n')
console.log('done')
