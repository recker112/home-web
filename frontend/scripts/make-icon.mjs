/**
 * Genera un PNG grande a partir de public/favicon.svg.
 *
 *   npm run icon                    → public/icon-512.png
 *   npm run icon -- 1024            → public/icon-1024.png
 *   npm run icon -- 512 --circular  → public/icon-512-circular.png
 *
 * Sirve para fotos de perfil (GitHub, Discord…), donde no se admite SVG.
 * El tamaño se ajusta al múltiplo de 16 más cercano para que cada píxel
 * del dibujo ocupe un número entero de píxeles y no salga borroso.
 *
 * La variante `--circular` encoge el dibujo al 75% y lo centra: muchas
 * plataformas recortan la foto en círculo, y a tamaño completo el acento
 * dorado de la esquina se queda fuera del recorte.
 *
 * No usa ninguna dependencia: escribe el PNG a mano con zlib.
 */

import { readFileSync, writeFileSync } from 'node:fs'
import zlib from 'node:zlib'

const GRID = 16
const SVG = new URL('../public/favicon.svg', import.meta.url)

/* ── PNG (color verdadero, sin filtros) ───────────────────── */

const CRC_TABLE = Array.from({ length: 256 }, (_, n) => {
  let c = n
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
  return c >>> 0
})

const crc32 = (buf) => {
  let c = 0xffffffff
  for (const b of buf) c = CRC_TABLE[(c ^ b) & 0xff] ^ (c >>> 8)
  return (c ^ 0xffffffff) >>> 0
}

const chunk = (type, data) => {
  const length = Buffer.alloc(4)
  length.writeUInt32BE(data.length)
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data])
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(body))
  return Buffer.concat([length, body, crc])
}

function writePng(path, size, rgb) {
  const stride = size * 3
  const raw = Buffer.alloc((stride + 1) * size)
  for (let y = 0; y < size; y++) {
    raw[y * (stride + 1)] = 0 // filtro "none"
    rgb.copy(raw, y * (stride + 1) + 1, y * stride, (y + 1) * stride)
  }

  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(size, 0)
  ihdr.writeUInt32BE(size, 4)
  ihdr[8] = 8 // bits por canal
  ihdr[9] = 2 // RGB

  writeFileSync(
    path,
    Buffer.concat([
      Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
      chunk('IHDR', ihdr),
      chunk('IDAT', zlib.deflateSync(raw, { level: 9 })),
      chunk('IEND', Buffer.alloc(0)),
    ]),
  )
}

/* ── Lectura del SVG ──────────────────────────────────────── */

const toRgb = (hex) => [
  parseInt(hex.slice(1, 3), 16),
  parseInt(hex.slice(3, 5), 16),
  parseInt(hex.slice(5, 7), 16),
]

/** Pinta los <rect> del favicon sobre una rejilla de 16x16. */
function readFavicon() {
  const svg = readFileSync(SVG, 'utf8')
  const cells = Array.from({ length: GRID }, () => Array(GRID).fill('#000000'))
  let groupFill = null

  for (const line of svg.split('\n')) {
    const group = line.match(/<g[^>]*fill="(#[0-9a-f]{6})"/i)
    if (group) groupFill = group[1]
    if (line.includes('</g>')) groupFill = null

    const rect = line.match(/<rect([^>]*)\/?>/i)
    if (!rect) continue

    const attrs = rect[1]
    const attr = (name, fallback = 0) => {
      const found = attrs.match(new RegExp(`${name}="(\\d+)"`))
      return found ? Number(found[1]) : fallback
    }
    const fillAttr = attrs.match(/fill="(#[0-9a-f]{6})"/i)
    const fill = fillAttr ? fillAttr[1] : groupFill
    if (!fill) continue

    const x = attr('x')
    const y = attr('y')
    const w = attr('width', 1)
    const h = attr('height', 1)
    for (let dy = 0; dy < h; dy++) {
      for (let dx = 0; dx < w; dx++) {
        if (y + dy < GRID && x + dx < GRID) cells[y + dy][x + dx] = fill
      }
    }
  }

  return cells
}

/* ── Salida ───────────────────────────────────────────────── */

const circular = process.argv.includes('--circular')
const requested = Number(process.argv.find((a) => /^\d+$/.test(a))) || 512

/* Con margen el dibujo ocupa 12 de las 16 celdas de ancho (75%), así que
   el lienzo tiene que ser múltiplo de 64 para que la escala siga entera. */
const unit = circular ? 64 : GRID
const scale = Math.max(1, Math.round(requested / unit))
const size = scale * unit
if (size !== requested) {
  console.log(`Ajustado ${requested} → ${size} px para que los píxeles queden exactos.`)
}

const cells = readFavicon()
const background = toRgb(cells[0][0])

const pixel = circular ? (size * 3) / (GRID * 4) : size / GRID
const offset = circular ? (size - pixel * GRID) / 2 : 0

const buf = Buffer.alloc(size * size * 3)
for (let y = 0; y < size; y++) {
  for (let x = 0; x < size; x++) {
    const gx = Math.floor((x - offset) / pixel)
    const gy = Math.floor((y - offset) / pixel)
    const inside = gx >= 0 && gx < GRID && gy >= 0 && gy < GRID
    const [r, g, b] = inside ? toRgb(cells[gy][gx]) : background
    const o = (y * size + x) * 3
    buf[o] = r
    buf[o + 1] = g
    buf[o + 2] = b
  }
}

const name = `icon-${size}${circular ? '-circular' : ''}.png`
const out = new URL(`../public/${name}`, import.meta.url)
writePng(out, size, buf)

const bytes = readFileSync(out).length
console.log(
  `✓ public/${name} · ${size}x${size} · píxel de ${pixel}px · ${(bytes / 1024).toFixed(1)} kB` +
    (circular ? ' · con margen para recorte circular' : ''),
)
