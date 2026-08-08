/**
 * Convierte mapas ASCII en rectángulos SVG.
 *
 * Cada fila se comprime en tramos horizontales del mismo color, así un
 * sprite de 16x16 acaba en ~40 <rect> en lugar de 256.
 */

export type Rect = { x: number; y: number; w: number; fill: string }
export type SpriteData = { rects: Rect[]; cols: number; rows: number }

const cache = new Map<string, SpriteData>()

export function parseSprite(map: string, palette: Record<string, string>): SpriteData {
  const cached = cache.get(map)
  if (cached) return cached

  const rows = map.trim().split('\n')
  const rects: Rect[] = []
  let cols = 0

  rows.forEach((row, y) => {
    cols = Math.max(cols, row.length)
    let x = 0
    while (x < row.length) {
      const char = row[x]
      const fill = palette[char]
      if (!fill) {
        x++
        continue
      }
      let w = 1
      while (row[x + w] === char) w++
      rects.push({ x, y, w, fill })
      x += w
    }
  })

  const data: SpriteData = { rects, cols, rows: rows.length }
  cache.set(map, data)
  return data
}
