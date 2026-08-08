/**
 * ─────────────────────────────────────────────────────────────
 *  PRESETS DEL SECUENCIADOR
 *  Añade aquí tus canciones. Se cargan solas en el selector.
 * ─────────────────────────────────────────────────────────────
 *
 *  CÓMO SE ESCRIBE UN PATRÓN
 *
 *  Cada línea de `track` es una nota y su ritmo:
 *
 *      'C4': 'x...x...x...x...'
 *             │└─ un carácter por paso
 *             └── 'x' suena · '.' silencio (vale cualquier otro carácter)
 *
 *  NOTAS DISPONIBLES
 *  Las tres octavas cromáticas de C3 a B5, semitonos incluidos:
 *      C3 C#3 D3 D#3 E3 F3 F#3 G3 G#3 A3 A#3 B3   … hasta B5
 *  Los bemoles también valen: 'Db4' es lo mismo que 'C#4'.
 *  Percusión: 'KICK', 'SNARE', 'HAT'.
 *
 *  LONGITUD
 *  `steps` puede ser 16, 32 o 64. Si una cadena es más corta se rellena
 *  con silencios; si es más larga, lo que sobra se conserva pero no suena
 *  hasta que subas `steps`.
 *
 *  Un paso es una semicorchea: con 16 pasos tienes un compás de 4/4.
 */

export type Track = {
  name: string
  bpm: number
  steps: 16 | 32 | 64
  track: Record<string, string>
}

export const tracks: Track[] = [
  {
    name: 'Arpegio en Am',
    bpm: 112,
    steps: 32,
    track: {
      //     |1...|2...|3...|4...|5...|6...|7...|8...|
      E5: '........x...............x.......',
      C5: '......x...x...........x...x.....',
      A4: '....x.......x.......x.......x...',
      E4: '..x...........x...x...........x.',
      A3: 'x...............x...............',
      HAT: '....x.......x.......x.......x...',
      KICK: 'x.......x.......x.......x.......',
    },
  },
  {
    name: 'Blues en A',
    bpm: 96,
    steps: 16,
    track: {
      //      |1...|2...|3...|4...|
      C5: '............x...',
      G4: '....x.......x...',
      'D#4': '......x.........', // la nota de blues
      E4: '..x.......x.....',
      A3: 'x...x...x...x...',
      HAT: '..x...x...x...x.',
      SNARE: '....x.......x...',
      KICK: 'x...x...x...x...',
    },
  },
  {
    name: 'Chiptune alegre',
    bpm: 140,
    steps: 16,
    track: {
      //      |1...|2...|3...|4...|
      G5: '....x.......x...',
      'F#5': '......x.........',
      E5: '..x.......x.....',
      C5: 'x.......x.......',
      C4: 'x...x...x...x...',
      HAT: '..x...x...x...x.',
      SNARE: '....x.......x...',
      KICK: 'x.......x.......',
    },
  },
  {
    name: 'En blanco',
    bpm: 120,
    steps: 16,
    track: {},
  },
]
