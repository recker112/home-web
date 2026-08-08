/**
 * Notas y percusión del secuenciador.
 *
 * Tres octavas cromáticas (C3–B5): todos los semitonos, sin escalas que
 * limiten lo que se puede componer.
 */

export type Row = {
  /** Identificador usado en los presets: 'C4', 'A#3', 'KICK'… */
  id: string
  label: string
  /** Las teclas negras se pintan más oscuras, como en un piano. */
  sharp: boolean
  kind: 'note' | 'drum'
  freq: number
  drum?: 'kick' | 'snare' | 'hat'
}

const NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']

/** Bemoles aceptados al escribir presets: Db4 y C#4 son la misma tecla. */
const FLAT_TO_SHARP: Record<string, string> = {
  DB: 'C#',
  EB: 'D#',
  FB: 'E',
  GB: 'F#',
  AB: 'G#',
  BB: 'A#',
  CB: 'B',
}

export const LOWEST_OCTAVE = 3
export const HIGHEST_OCTAVE = 5

/* C4 es el do central y equivale a la nota MIDI 60. */
const midiOf = (octave: number, semitone: number) => (octave + 1) * 12 + semitone
const freqOf = (midi: number) => 440 * Math.pow(2, (midi - 69) / 12)

function buildNoteRows(): Row[] {
  const rows: Row[] = []
  /* De agudo a grave: arriba en pantalla queda la nota más alta. */
  for (let octave = HIGHEST_OCTAVE; octave >= LOWEST_OCTAVE; octave--) {
    for (let semitone = 11; semitone >= 0; semitone--) {
      const name = NAMES[semitone]
      rows.push({
        id: `${name}${octave}`,
        label: `${name}${octave}`,
        sharp: name.includes('#'),
        kind: 'note',
        freq: freqOf(midiOf(octave, semitone)),
      })
    }
  }
  return rows
}

export const DRUM_ROWS: Row[] = [
  { id: 'HAT', label: 'HAT', sharp: false, kind: 'drum', freq: 0, drum: 'hat' },
  { id: 'SNARE', label: 'SNARE', sharp: false, kind: 'drum', freq: 0, drum: 'snare' },
  { id: 'KICK', label: 'KICK', sharp: false, kind: 'drum', freq: 0, drum: 'kick' },
]

export const NOTE_ROWS = buildNoteRows()
export const ROWS: Row[] = [...NOTE_ROWS, ...DRUM_ROWS]

const BY_ID = new Map(ROWS.map((r) => [r.id, r]))

/**
 * Traduce lo escrito en un preset a un identificador de fila.
 * Tolera minúsculas, espacios y bemoles: 'db4', ' Db4 ' y 'C#4' son lo mismo.
 * Devuelve null si la nota no existe en el rango disponible.
 */
export function normalizeRowId(raw: string): string | null {
  const clean = raw.trim().toUpperCase()
  if (!clean) return null
  if (BY_ID.has(clean)) return clean

  const match = clean.match(/^([A-G][#B]?)(-?\d)$/)
  if (!match) return null

  const [, rawName, octave] = match
  const name = FLAT_TO_SHARP[rawName] ?? rawName
  const id = `${name}${octave}`
  return BY_ID.has(id) ? id : null
}
