import { parseSprite } from './pixelRuntime'

/**
 * Retrato pixel art: 16x16, con auriculares puestos.
 * Los auriculares y la camiseta usan variables del tema, así que el sprite
 * cambia de color junto con el resto de la web.
 */

const MAP = `
................
....bbbbbbbb....
...bppppppppb...
..bbppppppppbb..
..bbpsssssspbb..
..bbseesseesbb..
..bbssssssssbb..
..bbsssmmsssbb..
...bssssssssb...
....ssssssss....
......ssss......
..cccccccccccc..
.cccccccccccccc.
.cccc111111cccc.
.cccc111111cccc.
.cccccccccccccc.`

const PALETTE: Record<string, string> = {
  p: '#3d2b1d', // pelo
  s: '#e0aa82', // piel
  e: '#1b2438', // ojos
  m: '#a35a48', // boca
  b: 'var(--blue)', // auriculares
  c: 'var(--blue-deep)', // camiseta
  '1': 'var(--cyan)', // estampado
}

export function Avatar({ size = 160, className }: { size?: number; className?: string }) {
  const { rects, cols, rows } = parseSprite(MAP, PALETTE)

  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox={`0 0 ${cols} ${rows}`}
      role="img"
      aria-label="Retrato pixel art de recker con auriculares"
    >
      {rects.map((r, i) => (
        <rect key={i} x={r.x} y={r.y} width={r.w} height={1} fill={r.fill} />
      ))}
    </svg>
  )
}
