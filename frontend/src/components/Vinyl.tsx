import { parseSprite } from './pixelRuntime'
import './Vinyl.css'

/**
 * Disco de vinilo en pixel art, 24x24.
 *
 * El mapa está generado por fórmula (distancia al centro), no dibujado a
 * mano: un círculo con surcos concéntricos tiene que ser simétrico o al
 * girar se nota el bulto.
 *
 *   o borde y agujero   d disco   g surco   l etiqueta
 */

const MAP = `
........................
........oooooooo........
......ooggggggggoo......
....ooggddddddddggoo....
...oogddggggggggddgoo...
...ogddgddddddddgddgo...
..ogddgddggggggddgddgo..
..ogdgdggdoooodggdgdgo..
.ogdgddgoolllloogddgdgo.
.ogdgdgdollllllodgdgdgo.
.ogdgdgollllllllogdgdgo.
.ogdgdgolllhhlllogdgdgo.
.ogdgdgolllhhlllogdgdgo.
.ogdgdgollllllllogdgdgo.
.ogdgdgdollllllodgdgdgo.
.ogdgddgoolllloogddgdgo.
..ogdgdggdoooodggdgdgo..
..ogddgddggggggddgddgo..
...ogddgddddddddgddgo...
...oogddggggggggddgoo...
....ooggddddddddggoo....
......ooggggggggoo......
........oooooooo........
........................`

/* El disco es negro en los dos temas —un vinilo lo es— pero la etiqueta
   sigue el color de la web. */
const PALETTE: Record<string, string> = {
  o: '#0b1220',
  h: '#0b1220',
  d: '#1b2438',
  g: '#39476b',
  l: 'var(--blue)',
}

type Props = {
  size?: number
  spinning?: boolean
  className?: string
}

export function Vinyl({ size = 96, spinning = false, className }: Props) {
  const { rects, cols, rows } = parseSprite(MAP, PALETTE)

  return (
    <svg
      className={`vinyl${spinning ? ' is-spinning' : ''}${className ? ` ${className}` : ''}`}
      width={size}
      height={size}
      viewBox={`0 0 ${cols} ${rows}`}
      role="img"
      aria-label={spinning ? 'Disco girando' : 'Disco parado'}
    >
      {rects.map((r, i) => (
        <rect key={i} x={r.x} y={r.y} width={r.w} height={1} fill={r.fill} />
      ))}
    </svg>
  )
}
