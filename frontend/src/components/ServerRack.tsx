import { parseSprite } from './pixelRuntime'

/**
 * Rack de servidor en pixel art, 24x24.
 *
 * Cuatro unidades con sus pilotos, un módulo de ventilación abajo y una
 * sombra proyectada a la derecha. Chasis, rejilla y sombra usan variables
 * del tema, así que el sprite cambia de color con el resto de la web; los
 * pilotos mantienen su color para que se lean siempre como pilotos.
 *
 *   o borde   c chasis   v rejilla o hueco
 *   g verde   y ámbar    b cian     s sombra
 */

const MAP = `
........................
........................
...oooooooooooooooooo...
...ocgcyccvvvvvvvvccoss.
...ocvcvcvcvcvcvcvcvoss.
...ooooooooooooooooooss.
...ocgcgccvvvvvvvvccoss.
...ocvcvcvcvcvcvcvcvoss.
...ooooooooooooooooooss.
...ocgcbccvvvvvvvvccoss.
...ocvcvcvcvcvcvcvcvoss.
...ooooooooooooooooooss.
...ocycgccvvvvvvvvccoss.
...ocvcvcvcvcvcvcvcvoss.
...ooooooooooooooooooss.
...occcccvvvvvvcccccoss.
...occcccvccccvcccccoss.
...occcccvvvvvvcccccoss.
...ooooooooooooooooooss.
....ooo..........ooo.ss.
.....ssssssssssssssssss.
........................
........................
........................`

const PALETTE: Record<string, string> = {
  o: 'var(--border-strong)',
  c: 'var(--surface-3)',
  v: 'var(--bg-grid)',
  g: 'var(--green)',
  y: 'var(--gold)',
  b: 'var(--cyan)',
  s: 'var(--shadow)',
}

export function ServerRack({ size = 144, className }: { size?: number; className?: string }) {
  const { rects, cols, rows } = parseSprite(MAP, PALETTE)

  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox={`0 0 ${cols} ${rows}`}
      role="img"
      aria-label="Rack de servidor en pixel art"
    >
      {rects.map((r, i) => (
        <rect key={i} x={r.x} y={r.y} width={r.w} height={1} fill={r.fill} />
      ))}
    </svg>
  )
}
