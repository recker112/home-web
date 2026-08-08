/**
 * Valida los presets del secuenciador antes de que lleguen al navegador.
 *
 *   npm run check:tracks
 *
 * Detecta lo que es fácil colar escribiendo patrones a mano: una nota
 * fuera de rango, un semitono mal escrito o una cadena a la que le falta
 * (o le sobra) un paso.
 */

import { normalizeRowId } from '../src/components/arcade/notes.ts'
import { tracks } from '../src/data/tracks.ts'

const VALID_STEPS = [16, 32, 64]

let errors = 0
let warnings = 0

const fail = (msg: string) => {
  errors++
  console.error(`  ✗ ${msg}`)
}
const warn = (msg: string) => {
  warnings++
  console.warn(`  ! ${msg}`)
}

for (const track of tracks) {
  console.log(`\n${track.name}  ·  ${track.steps} pasos  ·  ${track.bpm} bpm`)

  if (!VALID_STEPS.includes(track.steps)) {
    fail(`steps debe ser 16, 32 o 64 (es ${track.steps})`)
  }
  if (track.bpm < 50 || track.bpm > 200) {
    fail(`bpm fuera del rango del control deslizante 50-200 (es ${track.bpm})`)
  }

  const seen = new Map<string, string>()
  let notes = 0

  for (const [rawId, rhythm] of Object.entries(track.track)) {
    const id = normalizeRowId(rawId)

    if (!id) {
      fail(`"${rawId}" no existe. Usa C3–B5 (con # o b) o KICK / SNARE / HAT.`)
      continue
    }

    /* Dos grafías de la misma tecla se suman en silencio: mejor avisar. */
    const previous = seen.get(id)
    if (previous && previous !== rawId) {
      warn(`"${rawId}" y "${previous}" son la misma tecla (${id}): se combinan.`)
    }
    seen.set(id, rawId)

    if (rhythm.length !== track.steps) {
      const diff = rhythm.length < track.steps ? 'le faltan' : 'le sobran'
      fail(
        `"${rawId}" tiene ${rhythm.length} caracteres y el patrón declara ${track.steps}: ${diff} ${Math.abs(rhythm.length - track.steps)}.`,
      )
    }

    const invalid = [...new Set(rhythm.replace(/[x.]/g, '').split(''))]
    if (invalid.length) {
      warn(`"${rawId}" usa ${JSON.stringify(invalid)} — solo 'x' suena, el resto es silencio.`)
    }

    notes += [...rhythm].filter((c) => c === 'x').length
  }

  if (notes === 0 && Object.keys(track.track).length > 0) {
    warn('no hay ninguna nota activa.')
  }
  console.log(`  ${Object.keys(track.track).length} pistas · ${notes} notas`)
}

console.log(
  `\n${errors ? `✗ ${errors} error(es)` : '✓ presets correctos'}${warnings ? ` · ${warnings} aviso(s)` : ''}`,
)
process.exit(errors ? 1 : 0)
